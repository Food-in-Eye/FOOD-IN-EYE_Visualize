import { useState, useEffect, useRef, useCallback } from "react";
// import visualizationData from "../data/visualization_data.json";
import GenerateImgUrl from "./GenerateImgUrl.module";
import Style from "../css/style.module.css";
import { getHistory, getFixKey, getInfos } from "./API.module";
import { useLocation } from "react-router-dom";
import top1 from "../images/top1.png";
import top2 from "../images/top2.png";
import top3 from "../images/top3.png";
import receipt from "../images/receipt.png";

function GazeVisualization() {
  const location = useLocation();
  const { value } = location?.state || {};

  console.log(value);

  const [currentPage, setCurrentPage] = useState(0);
  const [previousCenter, setPreviousCenter] = useState(null);
  const [imgUrls, setImgUrls] = useState([]);
  const [fixationsIndex, setFixationsIndex] = useState(0);
  const [leftData, setLeftData] = useState([]);
  const [leftTOP3, setLeftTOP3] = useState([]);
  const [rightData, setRightData] = useState([]);
  const [rightTOP3, setRightTOP3] = useState([]);
  const [personalData, setPersonalData] = useState([]);
  const [personalTOP3, setPersonalTOP3] = useState([]);

  const [visualizationData, setVisualizationData] = useState([]);

  const canvasRef = useRef(null);
  const animationFrameId = useRef(null);

  let ctx, canvasWidth, canvasHeight;

  const drawCanvas = useCallback(() => {
    // const { currentPage, fixationsIndex } = this.state;
    console.log("currentPage", currentPage);
    const canvas = canvasRef.current;
    const fixations = visualizationData[currentPage]?.fixations;
    const imgSrc = imgUrls[currentPage];

    if (!canvas) {
      animationFrameId.current = requestAnimationFrame(() => {
        drawCanvas();
      });
      return;
    }

    ctx = canvas.getContext("2d");

    // ctx.clearRect(0, 0, canvas.width, canvas.height);
    // console.log("visualizationData", visualizationData[currentPage]);

    // console.log("fixations", fixations);
    const screenAspectRatio = 1080 / 2195;
    canvasWidth = canvas.width;
    canvasHeight = canvasWidth / screenAspectRatio;

    ctx.globalAlpha = 1;
    if (fixationsIndex === 0) {
      console.log("1. get background image");
      const img = new Image();
      img.src = imgSrc;
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
        console.log("2. draw img");
        // console.log("이미지 그리기");
        if (fixations.length > 0) {
          animationFrameId.current = requestAnimationFrame(() => {
            // console.log(fixations, ctx, canvasWidth, canvasHeight);
            console.log("3. draw fixation 호출111");
            drawFixations(fixations, ctx, canvasWidth, canvasHeight);
          });
        } else {
          // this.blurImage(ctx, canvasWidth, canvasHeight);
          // this.drawNoFixationMessage(ctx);
          console.log("fixations가 없을 때1");
          setTimeout(moveToNextCanvas, 2000);
        }
      };
    } else {
      // console.log("fixations", fixations);
      if (fixations.length > 0) {
        animationFrameId.current = requestAnimationFrame(() => {
          console.log("3. draw fixation 호출222");
          drawFixations(fixations);
        });
      } else {
        // this.blurImage(ctx, canvasWidth, canvasHeight);
        // this.drawNoFixationMessage(ctx);
        console.log("fixations가 없을 때2");
        setTimeout(moveToNextCanvas, 2000);
      }
    }
  }, [currentPage]);

  const drawFixations = (fixations) => {
    // const { fixationsIndex } = this.state;
    // console.log("2");

    console.log("!!!!", fixationsIndex);
    if (fixationsIndex >= fixations?.length) {
      setTimeout(moveToNextCanvas, 3000);
      return;
    }

    const fixation = fixations[fixationsIndex];
    const { x, y, d } = fixation;
    const interval = 100;
    // const interval = 1000;
    const steps = parseInt(d / 100);
    const stepDuration = d / steps;
    let step = 0;
    let currentRadius = 0;

    const drawStep = () => {
      // console.log("3");
      console.log("4. drawStep 실행");
      if (step >= steps) {
        if (fixationsIndex > 0) {
          console.log("draw saccade");
          const prevFixation = fixations[fixationsIndex - 1];
          const prevX = (prevFixation.x / 1080) * canvasWidth;
          const prevY = (prevFixation.y / 2195) * canvasHeight;
          const newX = (x / 1080) * canvasWidth;
          const newY = (y / 2195) * canvasHeight;

          ctx.globalCompositeOperation = "source-over";
          ctx.beginPath();
          ctx.moveTo(prevX, prevY);
          ctx.lineTo(newX, newY);
          ctx.strokeStyle = "#d11507";
          ctx.stroke();
        }

        setFixationsIndex(fixationsIndex + 1);
        setTimeout(() => {
          drawCanvas();
        }, 1000);
        // this.setState({ fixationsIndex: fixationsIndex + 1 }, () => {
        //   setTimeout(this.drawCanvas, interval);
        // });
        return;
      }

      // ctx.beginPath();

      const progress = step / steps;
      const newX = (x / 1080) * canvasWidth;
      const newY = (y / 2195) * canvasHeight;
      const radius = 10 * step * progress;

      if (step === 0) {
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(newX, newY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = "#d11507";
        ctx.fill();
      } else {
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(newX, newY, currentRadius, 0, 2 * Math.PI);
        ctx.arc(newX, newY, currentRadius - 5, 0, 2 * Math.PI);
        ctx.fillStyle = "rgba(209,21,7)";
        ctx.fill();
      }

      step++;
      currentRadius += 10;
      setTimeout(drawStep, stepDuration);
    };

    drawStep();
    console.log("5. drawstep 끝남");
  };
  const moveToNextCanvas = () => {
    // const { currentPage } = this.state;
    if (currentPage < visualizationData.length - 1) {
      setCurrentPage((prevPage) => prevPage + 1);
      setFixationsIndex(0);
      setPreviousCenter(null);

      animationFrameId.current = requestAnimationFrame(() => {
        drawCanvas();
      });

      // this.setState(
      //   {
      //     currentPage: currentPage + 1,
      //     fixationsIndex: 0,
      //     previousCenter: null,
      //   },
      //   () => {
      //     this.animationFrameId = requestAnimationFrame(() => {
      //       this.drawCanvas();
      //     });
      //   }
      // );
    }
  };

  useEffect(() => {
    // const { value } = this.props;
    // const { location } = this.context.router.route;
    // const hID = location.state?.value;
    // const { value: hID } = useParams();
    // console.log("hID", hID);

    const fetchData = async () => {
      try {
        const res = await getHistory(value);
        const leftData = Object.values(res.data.left);
        const rightData = Object.values(res.data.right);
        const personalData = Object.values(res.data.personal);
        const fixKey = res.data.fix_key;
        const newLeftTOP3 = [];
        leftData.forEach((item) => {
          for (const key in item.top3) {
            if (item.top3.hasOwnProperty(key)) {
              const [s_num, f_num] = key.split("-");
              const receivedData = getInfos(s_num, f_num);
              console.log("receivedData", receivedData);
              newLeftTOP3.push(receivedData);
            }
          }
        });

        const visualizeData = await getFixKey(fixKey);

        // console.log("visualizeData", visualizeData);

        const imgUrls = await Promise.all(
          visualizeData.data.map(async (page) => {
            return await GenerateImgUrl(page.s_num, page.f_num);
          })
        );

        setImgUrls(imgUrls);
        // console.log("12??", imgUrls);
        setVisualizationData(visualizeData.data);
        // setLeftTOP3(newLeftTOP3);

        // animationFrameId.current = requestAnimationFrame(() => {
        //   console.log("2.drawCanvas");
        //   drawCanvas();
        // });
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
    if (imgUrls.length !== 0) {
      animationFrameId.current = requestAnimationFrame(() => {
        console.log("drawCanvas");
        drawCanvas();
      });
    }
  }, [imgUrls]);

  // render() {
  return (
    <div className={Style.total}>
      <section className={Style.menus}>
        <div className={Style.simpleDashboard}>
          <h2>&lt; 내가 가장 많이 본 메뉴 &gt;</h2>
          <section className={Style.TOP3_2}>
            <div>
              <img src={top1} alt="1등" />
              <p>1</p>
            </div>
            <div>
              <img src={top2} alt="2등" />
              <p>1</p>
            </div>
            <div>
              <img src={top3} alt="3등" />
              <p>1</p>
            </div>
          </section>
          <div className={Style.menusTOP3}>
            <h2>&lt;오늘 사람들이 본 메뉴 중 &gt;</h2>
            <section className={Style.TOP3_1}>
              <h3>많이 봤는데 판매량이 적은 메뉴 TOP3</h3>
              <div>
                <img src={top1} alt="1등" />
                <p>{leftTOP3[2]}</p>
              </div>
              <div>
                <img src={top2} alt="2등" />
                <p>{leftTOP3[1]}</p>
              </div>
              <div>
                <img src={top3} alt="3등" />
                <p>{leftTOP3[0]}</p>
              </div>
            </section>
            <section className={Style.TOP3_2}>
              <h3>적게 봤는데 판매량이 많은 메뉴 TOP3</h3>
              <div>
                <img src={top1} alt="1등" />
                <p>1</p>
              </div>
              <div>
                <img src={top2} alt="2등" />
                <p>1</p>
              </div>
              <div>
                <img src={top3} alt="3등" />
                <p>1</p>
              </div>
            </section>
          </div>
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
          <img src={receipt} alt="주문 내역" />
          <div className={Style.receiptBody}>
            <span>주문 일시: </span>
            <hr />
            <div className={Style.receiptInfo}>
              <section>
                <span>상품명 </span>
              </section>
              <section>
                <span>수량 </span>
              </section>
              <section>
                <span>가격 </span>
              </section>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
// }

export default GazeVisualization;
