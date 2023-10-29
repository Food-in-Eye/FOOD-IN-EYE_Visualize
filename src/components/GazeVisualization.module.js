import React, { Component } from "react";
import visualizationData from "../data/visualization_data.json";
import GenerateImgUrl from "./GenerateImgUrl.module";
import Style from "../css/style.module.css";
import top1 from "../images/top1.png";
import top2 from "../images/top2.png";
import top3 from "../images/top3.png";
import receipt from "../images/receipt.png";

class GazeVisualization extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPage: 0,
      previousCenter: null,
      imgUrls: [],
      fixationsIndex: 0,
    };
    this.canvasRef = React.createRef();
    this.animationFrameId = null;
  }

  async componentDidMount() {
    // Load image URLs
    const imgUrls = await Promise.all(
      visualizationData.map(async (page) => {
        return await GenerateImgUrl(page.s_num, page.f_num);
      })
    );

    this.setState({ imgUrls }, () => {
      this.animationFrameId = requestAnimationFrame(() => {
        this.drawCanvas();
      });
    });
  }

  componentWillUnmount() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  // blurImage = (ctx, canvasWidth, canvasHeight) => {
  //   ctx.filter = "blur(10px)"; // 블러 처리
  //   ctx.drawImage(this.canvasRef.current, 0, 0, canvasWidth, canvasHeight);
  //   ctx.filter = "none"; // 블러 처리 해제
  // };

  // drawNoFixationMessage = (ctx) => {
  //   ctx.font = "50px Arial";
  //   ctx.fillStyle = "blue";
  //   ctx.fillText("시선 없는 페이지", 50, 50);
  // };

  drawCanvas = () => {
    const { currentPage, fixationsIndex } = this.state;
    const canvas = this.canvasRef.current;

    if (!canvas) {
      this.animationFrameId = requestAnimationFrame(() => {
        this.drawCanvas();
      });
      return;
    }

    const ctx = canvas.getContext("2d");
    const { fixations } = visualizationData[currentPage];
    const screenAspectRatio = 1080 / 2195;
    const canvasWidth = canvas.width;
    const canvasHeight = canvasWidth / screenAspectRatio;

    ctx.globalAlpha = 1;
    if (fixationsIndex === 0) {
      const img = new Image();
      img.src = this.state.imgUrls[currentPage];
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
        if (fixations.length > 0) {
          this.animationFrameId = requestAnimationFrame(() => {
            this.drawFixations(fixations, ctx, canvasWidth, canvasHeight);
          });
        } else {
          // this.blurImage(ctx, canvasWidth, canvasHeight);
          // this.drawNoFixationMessage(ctx);
          console.log("fixations가 없을 때1");
          setTimeout(this.moveToNextCanvas, 2000);
        }
      };
    } else {
      if (fixations.length > 0) {
        this.animationFrameId = requestAnimationFrame(() => {
          this.drawFixations(fixations, ctx, canvasWidth, canvasHeight);
        });
      } else {
        // this.blurImage(ctx, canvasWidth, canvasHeight);
        // this.drawNoFixationMessage(ctx);
        console.log("fixations가 없을 때2");
        setTimeout(this.moveToNextCanvas, 2000);
      }
    }
  };

  drawFixations = (fixations, ctx, canvasWidth, canvasHeight) => {
    const { fixationsIndex } = this.state;
    if (fixationsIndex >= fixations.length) {
      console.log("drawFixations");
      setTimeout(this.moveToNextCanvas, 3000);
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
      if (step >= steps) {
        if (fixationsIndex > 0) {
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

        this.setState({ fixationsIndex: fixationsIndex + 1 }, () => {
          setTimeout(this.drawCanvas, interval);
        });
        return;
      }

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
  };

  moveToNextCanvas = () => {
    const { currentPage } = this.state;
    if (currentPage < visualizationData.length - 1) {
      this.setState(
        {
          currentPage: currentPage + 1,
          fixationsIndex: 0,
          previousCenter: null,
        },
        () => {
          this.animationFrameId = requestAnimationFrame(() => {
            this.drawCanvas();
          });
        }
      );
    }
  };

  render() {
    return (
      <div className={Style.total}>
        <section className={Style.menus}>
          <div className={Style.simpleDashboard}>
            <h2>&lt; 내가 가장 많이 본 메뉴 &gt;</h2>
            <span></span>
            <div className={Style.menusTOP3}>
              <h2>&lt;오늘 사람들이 본 메뉴 중 &gt;</h2>
              <section className={Style.TOP3_1}>
                <h3>많이 봤는데 판매량이 적은 메뉴 TOP3</h3>
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
              ref={this.canvasRef}
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
}

export default GazeVisualization;
