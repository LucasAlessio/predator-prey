import { TypeAgentEnum } from "../../enum/TypeAgentEnum";
import { useEnviroment } from "../../hooks/useEnviroment";
import { Table, Td } from "./styles";

export const Enviroment = () => {
	const { enviroment, isPlaying, togglePlay } = useEnviroment();

	return (
		<>
			<Table>
				<tbody>
					{ enviroment.map((line, indexLine) => {
						return (
							<tr key={indexLine}>
								{ line.map(({ agent, pheronomeIntensity }, indexCol) => {
									return (
										<Td key={indexCol} intensity={pheronomeIntensity}>
											{ agent === TypeAgentEnum.PREY && <img src={`${process.env.PUBLIC_URL}prey.png`} alt="" /> }
											{ agent === TypeAgentEnum.PREDATOR && <img src={`${process.env.PUBLIC_URL}predator.png`} alt="" /> }
										</Td>
									);
								}) }
							</tr>
						)
					}) }
				</tbody>
			</Table>

			<button onClick={() => togglePlay()}>{ isPlaying ? "Pause" : "Play" }</button>
		</>
	);
}
