import axios from "axios";

const URL = "/api/v2/exhibition";

export const getDateList = () => {
  const requestUrl = `${URL}/historys`;
  return axios.get(requestUrl);
};

export const getHistory = (id) => {
  const requestUrl = `${URL}/history?h_id=${id}`;
  return axios.get(requestUrl);
};

export const getFixKey = (key) => {
  const requestUrl = `${URL}/visualize?fix_key=${key}`;
  return axios.get(requestUrl);
};

export const getInfos = (s_num, f_num) => {
  const requestUrl = `${URL}/info?s_num=${s_num}&f_num=${f_num}`;
  return axios.get(requestUrl);
};
