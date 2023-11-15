import { useState, useEffect, useRef, useCallback } from "react";
// import visualizationData from "../data/visualization_data.json";
import GenerateImgUrl from "./GenerateImgUrl.module";
import Style from "../css/style.module.css";
import { getHistory, getFixKey, getInfos } from "./API.module";
import { useLocation } from "react-router-dom";
import ReceiptTable from "../components/ReceiptTable.module";
import top1 from "../images/top1.png";
import top2 from "../images/top2.png";
import top3 from "../images/top3.png";
import receipt from "../images/receipt.png";

function GazeVisualization() {
  const location = useLocation();
  const { value } = location?.state || {};

  const [currentPage, setCurrentPage] = useState(-1);
  const [imgUrls, setImgUrls] = useState([]);
  const [fixationsIndex, setFixationsIndex] = useState(-1);
  const [leftData, setLeftData] = useState([]);
  const [LOW3key, setLOW3key] = useState([]);
  const [TOP3key, setTOP3key] = useState([]);
  const [LOW3Data, setLOW3Data] = useState([]);
  const [TOP3Data, setTOP3Data] = useState([]);
  const [receiptDate, setReceiptDate] = useState("");
  const [receiptData, setReceiptData] = useState([]);
  const [personalData, setPersonalData] = useState([]);
  const [personalTOP3, setPersonalTOP3] = useState([]);

  const [visualizationData, setVisualizationData] = useState([]);
  const [ctx, setCtx] = useState(null);
  const [canvasWidth, setCanvasWidth] = useState(0);
  const [canvasHeight, setCanvasHeight] = useState(0);

  const canvasRef = useRef(null);
  const animationFrameId = useRef(null);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const imgSrc = imgUrls[currentPage];

    if (!canvas) {
      animationFrameId.current = requestAnimationFrame(() => {
        drawCanvas();
      });
      return;
    }

    const ctx = canvas.getContext("2d");

    const screenAspectRatio = 1080 / 2195;
    const canvasWidth = canvas.width;
    const canvasHeight = canvasWidth / screenAspectRatio;
    setCtx(ctx);
    setCanvasWidth(canvasWidth);
    setCanvasHeight(canvasHeight);

    ctx.globalAlpha = 1;
    const img = new Image();
    img.src = imgSrc;
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);

      if (visualizationData[currentPage].fixations.length > 0) {
        setFixationsIndex(0);
      } else {
        setTimeout(moveToNextCanvas, 2000);
      }
    };
  }, [currentPage]);

  const drawFixations = useCallback(() => {
    if (fixationsIndex >= visualizationData[currentPage].fixations.length) {
      setTimeout(moveToNextCanvas, 2000);
      return;
    }

    const fixation = visualizationData[currentPage].fixations[fixationsIndex];
    const { x, y, d } = fixation;
    const interval = 100;
    // const interval = 1000;
    const steps = parseInt(d / 100);
    const stepDuration = d / steps;
    let step = 0;
    let currentRadius = 8;

    const drawStep = () => {
      if (step > steps) {
        setFixationsIndex(fixationsIndex + 1);
        return;
      }

      // const progress = step / steps;
      const newX = (x / 1080) * canvasWidth;
      const newY = (y / 2195) * canvasHeight;

      if (step === 0) {
        if (fixationsIndex > 0) {
          const prevFixation =
            visualizationData[currentPage].fixations[fixationsIndex - 1];
          const prevX = (prevFixation.x / 1080) * canvasWidth;
          const prevY = (prevFixation.y / 2195) * canvasHeight;
          const newX = (x / 1080) * canvasWidth;
          const newY = (y / 2195) * canvasHeight;

          ctx.globalCompositeOperation = "source-over";
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(prevX, prevY);
          ctx.lineTo(newX, newY);
          ctx.strokeStyle = "#d11507";
          ctx.stroke();
        }
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(newX, newY, 8, 0, 2 * Math.PI);
        ctx.fillStyle = "#d11507";
        ctx.fill();
      } else {
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(newX, newY, currentRadius, 0, 2 * Math.PI);
        // ctx.arc(newX, newY, currentRadius - 5, 0, 2 * Math.PI);
        ctx.fillStyle = "#d11507";
        ctx.fill();
      }

      step++;
      currentRadius += 10;
      setTimeout(drawStep, interval);
    };

    drawStep();
  }, [fixationsIndex]);

  const moveToNextCanvas = () => {
    if (currentPage < visualizationData.length - 1) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const formatDate = (date) => {
    const dateObject = new Date(date);
    const year = dateObject.getFullYear();
    const month = dateObject.getMonth() + 1; // Month is zero-based, so add 1
    const day = dateObject.getDate();
    const hours = dateObject.getHours();
    const minutes = dateObject.getMinutes();
    const seconds = dateObject.getSeconds();

    const formattedDate = `${year}-${String(month).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")} ${String(hours).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;
    return formattedDate;
  };

  const getDataFromKey = async (prevData) => {
    const newData = [];
    for (const data of prevData) {
      const menuNameData = {};

      for (const key in data) {
        const [s_num, f_num] = key.split("-");

        try {
          const res = await getInfos(s_num, f_num);
          console.log("getInfos res", res);
          const menuName = res.data;

          menuNameData[key] = {
            ...data[key],
            menuName,
          };
        } catch (error) {
          console.error(error);
          menuNameData[key] = { ...data[key] };
        }
      }
      newData.push(menuNameData);
    }
    return newData;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getHistory(value);
        console.log("res", res);
        const leftData = Object.values(res.data.left);
        const rightData = Object.values(res.data.right);
        const personalData = Object.values(res.data.personal);
        const fixKey = res.data.fix_key;

        console.log("leftData", leftData);
        getDataFromKey(leftData).then((value) => {
          console.log("leftDataWithMenuName", value);
          if (value.length > 0) {
            setLOW3Data(value[0]);
            setTOP3Data(value[1]);
          }
        });
        const lowKeysArray = LOW3Data.map((obj) => Object.keys(obj));
        const topKeysArray = TOP3Data.map((obj) => Object.keys(obj));

        setLOW3key(lowKeysArray);
        setTOP3key(topKeysArray);

        // console.log("leftDataWithMenuName", leftDataWithMenuName);

        const newDate = formatDate(rightData[0]);
        setReceiptDate(newDate);
        setReceiptData(rightData[1]);

        getDataFromKey(personalData).then((value) => {
          console.log("personal value", value);
          setPersonalTOP3(value);
        });

        const visualizeData = await getFixKey(fixKey);
        console.log("visualizeData", visualizeData);

        const imgUrls = await Promise.all(
          visualizeData.data.map(async (page) => {
            console.log(page.s_num, page.f_num);
            return await GenerateImgUrl(page.s_num, page.f_num);
          })
        );

        setImgUrls(imgUrls);

        setVisualizationData(visualizeData.data);
        // setLeftTOP3(newLeftTOP3);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [value]);

  useEffect(() => {
    // imgUrls 상태가 업데이트될 때마다 drawCanvas 함수를 호출

    if (imgUrls.length > 0) {
      setCurrentPage(0);
    }
  }, [imgUrls]);

  useEffect(() => {
    drawCanvas();
  }, [currentPage, drawCanvas]);

  useEffect(() => {
    if (fixationsIndex !== -1) {
      drawFixations();
    }
  }, [fixationsIndex, drawFixations]);

  console.log(LOW3key, TOP3key);

  // render() {
  return (
    <div className={Style.total}>
      <section className={Style.menus}>
        <div className={Style.simpleDashboard}>
          {/* <h2>&lt; 내가 가장 많이 본 메뉴 &gt;</h2>
          <section className={Style.TOP3_2}>
            <div>
              <img src={top1} alt="1등" />
              <p>{personalTOP3[0]}</p>
            </div>
            <div>
              <img src={top2} alt="2등" />
              <p>{personalTOP3[1]}</p>
            </div>
            <div>
              <img src={top3} alt="3등" />
              <p>{personalTOP3[2]}</p>
            </div>
          </section> */}
          {/* <div className={Style.menusTOP3}>
            <h2>&lt;오늘 사람들이 본 메뉴 중 &gt;</h2>
            <section className={Style.TOP3_1}>
              <h3>많이 봤는데 판매량이 적은 메뉴 TOP3</h3>
              <div>
                <img src={top1} alt="1등" />
                <p>{TOP3Data[2]["menuName"]}</p>
              </div>
              <div>
                <img src={top2} alt="2등" />
                <p>{TOP3Data[1]["menuName"]}</p>
              </div>
              <div>
                <img src={top3} alt="3등" />
                <p>{TOP3Data[0]["menuName"]}</p>
              </div>
            </section>
            <section className={Style.TOP3_2}>
              <h3>적게 봤는데 판매량이 많은 메뉴 TOP3</h3>
              <div>
                <img src={top1} alt="1등" />
                <p>{LOW3Data[0]["menuName"]}</p>
              </div>
              <div>
                <img src={top2} alt="2등" />
                <p>{LOW3Data[1]["menuName"]}</p>
              </div>
              <div>
                <img src={top3} alt="3등" />
                <p>{LOW3Data[2]["menuName"]}</p>
              </div>
            </section>
          </div> */}
        </div>
      </section>
      <section className={Style.visualizeSec}>
        <h2>주문 과정에서의 시선 흐름 과정</h2>
        <div className={Style.canvasDiv}>
          <canvas
            ref={canvasRef}
            width={1080}
            height={2195}
            style={{
              border: "1px solid #000",
              margin: "0px 10px",
            }}
          ></canvas>
        </div>
      </section>
      <section className={Style.receipt}>
        <h2>주문 내역</h2>
        <div className={Style.receiptWhole}>
          {/* <img src={receipt} alt="주문 내역" /> */}
          <div className={Style.receiptBody}>
            <span>주문 일시: {receiptDate}</span>
            <hr />
            <div className={Style.receiptInfo}>
              <ReceiptTable data={receiptData} />
              {/* <ul>
                {receiptData.map((foodItem, index) => (
                  <li key={index}>
                    <section>
                      <span>가게명 {foodItem.s_name}</span>
                    </section>
                    <section>
                      <span>상품명 {foodItem.f_name}</span>
                    </section>
                    <section>
                      <span>수량 {foodItem.count}</span>
                    </section>
                    <section>
                      <span>가격 {foodItem.price}</span>
                    </section>
                  </li>
                ))}
              </ul> */}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
// }

export default GazeVisualization;
