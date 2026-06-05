const DEV_IP = '10.0.0.1'; // substitua pelo IP local da máquina onde o backend está rodando (ipconfig no Windows / ifconfig no Mac)

export const API_BASE_URL = __DEV__
  ? `http://${DEV_IP}:3333/v1`
  : 'https://api.avisarp.com/v1';
