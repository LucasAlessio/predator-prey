import { lighten } from "polished";
import styled, { css } from "styled-components";
import { ConfigEnum } from "../../enum/ConfigEnum";
import { TypeAgentEnum } from "../../enum/TypeAgentEnum";
import { IntensityRange, TLocal } from "../../types";

type TdProps = {
	type?: TLocal["agent"],
	intensity: IntensityRange
}

export const Table = styled.table`
	border-collapse: collapse;
`;

export const Td = styled.td<TdProps>`
	width: 25px;
	height: 25px;
	border: 1px solid #000;

	${props => props.type === TypeAgentEnum.PREY && css`
		/* background: #009fff; */
	`}

	${props => props.type === TypeAgentEnum.PREDATOR && css`
		/* background: #f00; */
	`}

	${props => props.type === TypeAgentEnum.PREDATOR && css`
		/* background: #f00; */
	`}

	${({ intensity }) => intensity > 0 && css`
		background-color: ${lighten(0.4 - (intensity / (ConfigEnum.MAX_PHEROMONE_INTENSITY - 1) * 0.4), "#fcd823")};
	`}

	img {
		display: block;
		max-width: 100%;
		max-height: 100%;
		margin: 0 auto;
	}
`;
