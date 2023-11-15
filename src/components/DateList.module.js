import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DT from "../css/datelist.module.css";
import { getDateList } from "./API.module";

function DateList() {
  const navigate = useNavigate();
  const [historyList, setHistoryList] = useState([]);

  const getHistories = async () => {
    getDateList().then((res) => {
      console.log(res);
      setHistoryList(res.data);
    });
  };

  useEffect(() => {
    try {
      getHistories();
    } catch (error) {
      console.error(error);
    }
  }, []);

  const handleClickedDate = (key, value) => {
    console.log(value);
    navigate("/exhibition", { state: { value } });
  };

  return (
    <div>
      <div className={DT.inner}>
        <div className={DT.upper}>
          <h2>날짜 리스트</h2>
          <p>분석을 보고싶은 메뉴를 선택하세요!</p>
        </div>
        <div className={DT.menus}>
          <ul>
            {historyList.map((historyItem, index) => {
              const key = Object.keys(historyItem)[0];
              const value = historyItem[key];

              return (
                <li
                  key={index}
                  draggable={true}
                  onClick={() => handleClickedDate(key, value)}
                >
                  {`${key}`}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default DateList;
