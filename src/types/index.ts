import { ConfigEnum } from "../enum/ConfigEnum";
import { TypeAgentEnum } from "../enum/TypeAgentEnum";

type Enumerate<N extends number, Acc extends number[] = []> = Acc['length'] extends N ? Acc[number] : Enumerate<N, [...Acc, Acc['length']]>

type IntRange<F extends number, T extends number> = Exclude<Enumerate<T>, Enumerate<F>>

export type EnviromentProviderProps = {
	children: React.ReactElement;
}

export type IntensityRange = IntRange<0, typeof ConfigEnum.MAX_PHEROMONE_INTENSITY>;

export type TAgent = typeof TypeAgentEnum[keyof typeof TypeAgentEnum];

export type TLocal = {
	agent: 0 | TAgent,
	pheronomeIntensity: IntensityRange,
}

export type TEnviroment = TLocal[][];

export type TEnviromentData = {
	enviroment: TEnviroment
	isPlaying: boolean,
	togglePlay: () => void,
}

export type TPositions = [number, number][];

export type TDirections = "top" | "right" | "left" | "bottom";

export type TCoord = [number, number];
