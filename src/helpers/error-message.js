import env from '../client-envs/current.js';

const { SUPPORT_EMAIL } = env;

const errorMessage = 
`Algo inesperado aconteceu. Por favor busque suporte no endereço eletrônico ${SUPPORT_EMAIL}`;

export default errorMessage;