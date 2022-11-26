import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { ConfigEnum } from "../enum/ConfigEnum";
import { TypeAgentEnum } from "../enum/TypeAgentEnum";
import { ArrayHelper } from "../helpers/ArrayHelper";
import { EnviromentProviderProps, TAgent, TCoord, TDirections, TEnviroment, TEnviromentData, TLocal, TPositions } from "../types";

const EnviromentContext = createContext<TEnviromentData>({} as TEnviromentData);

const SIZE = 30;

export const EnviromentProvider = ({ children }: EnviromentProviderProps) => {
	const AMOUNT_PREYS = useRef<number>(1);
	const AMOUNT_PREDATORS = useRef<number>(25);

	const positions = useRef<TPositions>(
		Array.from({ length: AMOUNT_PREYS.current + AMOUNT_PREDATORS.current }, () => {
			return [Math.floor(Math.random() * SIZE), Math.floor(Math.random() * SIZE)] as TPositions[number];
		})
	);

	const [enviroment, setEnviroment] = useState<TEnviroment>(() => makeEnviroment(positions.current, AMOUNT_PREYS.current));
	const [isPlaying, setIsPlaying] = useState(false);

	const togglePlay = useCallback(() => {
		setIsPlaying(!isPlaying);
	}, [isPlaying]);

	useEffect(() => {
		if (!isPlaying) return;

		const timeout = setTimeout(() => {
			const {enviroment: newEnviroment, positions: newPositions} = move(enviroment, positions.current, AMOUNT_PREYS.current);
			releasePheronome(newEnviroment, newPositions, AMOUNT_PREYS.current);
			
			setEnviroment(newEnviroment);
			positions.current = newPositions;
		}, 500);

		return () => {
			clearTimeout(timeout);
		}
	}, [isPlaying, enviroment, AMOUNT_PREYS]);

	return (
		<EnviromentContext.Provider value={{
			enviroment,
			isPlaying,
			togglePlay,
		}}>
			{children}
		</EnviromentContext.Provider>
	);
}

export const useEnviroment = () => {
	return useContext<TEnviromentData>(EnviromentContext);
}

const makeEnviroment = (positions: TPositions, amountPreys: number, enviroment?: TEnviroment): TEnviroment => {
	const a: TEnviroment = Array.from({ length: SIZE }, (_, line) => {
		return Array.from({ length: SIZE }, (_, col) => ({
			agent: 0,
			pheronomeIntensity: enviroment ? enviroment[line][col].pheronomeIntensity : 0,
		}))
	});

	positions.forEach(([i, j], index) => {
		a[i][j].agent = index >= amountPreys ? TypeAgentEnum.PREDATOR : TypeAgentEnum.PREY;
	});

	return a;
}

const calculateEnviromentPos = (coord: number) => {
	if (coord < 0) {
		return (SIZE - 1);
	}

	return coord % SIZE;
}

const move = (enviroment: TEnviroment, positions: TPositions, amountPreys: number) => {
	const checkPositionsTable: (number | false)[][] = Array.from({ length: SIZE }, (_, index) => {
		return Array.from({ length: SIZE }, () => false)
	});

	const newPositions = ArrayHelper.clone(positions);

	/**
	 * calculating collisions
	 */
	positions.forEach(([line, col], index) => {
		const moves = calculatePossibleMoves(enviroment, enviroment[line][col].agent, [line, col]);

		if (moves.length === 0) {
			return;
		}

		const move = moves[Math.floor(Math.random() * moves.length)];

		const calculatedPos = [calculateEnviromentPos(line + move[0]), calculateEnviromentPos(col + move[1])];
		const agentNumber = checkPositionsTable[calculatedPos[0]][calculatedPos[1]];

		if (agentNumber !== false) {
			newPositions[agentNumber] = positions[agentNumber];
			newPositions[index] = positions[index];

			return;
		}

		checkPositionsTable[calculatedPos[0]][calculatedPos[1]] = index;
		newPositions[index] = calculatedPos as TPositions[number];
	});

	return {
		positions: newPositions,
		enviroment: makeEnviroment(newPositions, amountPreys, enviroment),
	}
}

const releasePheronome = (enviroment: TEnviroment, positions: TPositions, amountPreys: number) => {
	const fov = [
		[-1, -1], [-1, 0], [-1, 1],
		[0, -1], [0, 1],
		[1, -1], [1, 0], [1, 1]
	];

	enviroment.forEach((line, i) => {
		line.forEach((_, j) => {
			if (Number.isInteger(enviroment[i][j].pheronomeIntensity) && enviroment[i][j].pheronomeIntensity > 0) {
				enviroment[i][j].pheronomeIntensity = Number(enviroment[i][j].pheronomeIntensity) - 1 as TLocal["pheronomeIntensity"];
			}
		});
	});

	for(let i = amountPreys; i < positions.length; i++) {
		fov.forEach(([line, col]) => {
			const calculatedPos = [calculateEnviromentPos(line + positions[i][0]), calculateEnviromentPos(col + positions[i][1])];

			if (enviroment[calculatedPos[0]][calculatedPos[1]].agent === TypeAgentEnum.PREY) {
				enviroment[positions[i][0]][positions[i][1]].pheronomeIntensity = (ConfigEnum.MAX_PHEROMONE_INTENSITY - 1) as TLocal["pheronomeIntensity"];
			}
		});
	}

	return enviroment;
}

const calculatePossibleMoves = (enviroment: TEnviroment, agent: 0 | TAgent, pos: TCoord): TCoord[] => {
	if (agent === TypeAgentEnum.PREY) {
		return calculatePossibleMovesPrey(enviroment, agent, pos);
	}

	return calculatePossibleMovesPredator(enviroment, agent, pos);
	// return Object.values(moves) as TCoord[];
}

const calculatePossibleMovesPrey = (enviroment: TEnviroment, agent: 0 | TAgent, pos: TCoord): TCoord[] => {
	const moves = {
		top: [-1, 0],
		right: [0, 1],
		bottom: [1, 0],
		left: [0, -1]
	}

	const adjacents: Record<TDirections, TDirections[]> = {
		top: ["right", "left"],
		right: ["top", "bottom"],
		bottom: ["right", "left"],
		left: ["top", "bottom"],
	}

	const opposites: Record<TDirections, TDirections> = {
		top: "bottom",
		right: "left",
		bottom: "top",
		left: "right",
	}

	const blockDirs = Object.entries(moves).reduce<TDirections[]>((acc, [ direction, [ line, col ] ]) => {
		const calculatedPos = [calculateEnviromentPos(pos[0] + line), calculateEnviromentPos(pos[1] + col)];

		if (enviroment[calculatedPos[0]][calculatedPos[1]].agent === TypeAgentEnum.PREDATOR) {
			return [...acc, direction as TDirections];
		}

		return acc;
	}, []);

	if (blockDirs.length === 0) {
		return Object.values(moves) as TCoord[];
	}

	const possibleMoves = blockDirs.reduce<TCoord[]>((_, direction) => {
		const moveOpposite = moves[opposites[direction]];
		const calculatedPos = [calculateEnviromentPos(pos[0] + moveOpposite[0]), calculateEnviromentPos(pos[1] + moveOpposite[1])];

		if (enviroment[calculatedPos[0]][calculatedPos[1]].agent !== TypeAgentEnum.PREDATOR) {
			return [moveOpposite] as TCoord[];
		} else {
			return adjacents[direction].reduce<TCoord[]>((acc, adjacent) => {
				const moveAdjacent = moves[adjacent];

				const calculatedPos = [calculateEnviromentPos(pos[0] + moveAdjacent[0]), calculateEnviromentPos(pos[1] + moveAdjacent[1])];

				if (enviroment[calculatedPos[0]][calculatedPos[1]].agent !== TypeAgentEnum.PREDATOR) {
					return [...acc, moveAdjacent] as TCoord[];
				}

				return acc;
			}, []);
		}
	}, []);

	return possibleMoves;
}

const calculatePossibleMovesPredator = (enviroment: TEnviroment, agent: 0 | TAgent, pos: TCoord): TCoord[] => {
	const moves = {
		top: [-1, 0],
		right: [0, 1],
		bottom: [1, 0],
		left: [0, -1]
	}

	let sightedPrey = false;
	let maxPheronomeIntensity = 0;

	const possibleMoves = Object.entries(moves).reduce<TCoord[]>((acc, [ direction, [ line, col ] ]) => {
		const calculatedPos = [calculateEnviromentPos(pos[0] + line), calculateEnviromentPos(pos[1] + col)];

		if (enviroment[calculatedPos[0]][calculatedPos[1]].agent === TypeAgentEnum.PREY) {
			if (sightedPrey === false) {
				sightedPrey = true;
				return [[ line, col ] as TCoord];
			} else {
				return [...acc, [ line, col ] as TCoord];
			}
		}

		if (sightedPrey === false) {
			if (enviroment[calculatedPos[0]][calculatedPos[1]].pheronomeIntensity > 0) {
				if (enviroment[calculatedPos[0]][calculatedPos[1]].pheronomeIntensity > maxPheronomeIntensity) {
					return [[ line, col ] as TCoord];
				} else if (enviroment[calculatedPos[0]][calculatedPos[1]].pheronomeIntensity === maxPheronomeIntensity) {
					return [...acc, [ line, col ] as TCoord];
				}
			}
		}

		return acc;
	}, []);

	if (possibleMoves.length > 0) {
		return possibleMoves;
	}

	return [
		[-1, 0],
		[0, 1],
		[1, 0],
		[0, -1]
	] as TCoord[]
}
