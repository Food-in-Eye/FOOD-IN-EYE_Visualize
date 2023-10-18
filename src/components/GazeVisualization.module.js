import React, { Component } from "react";
// import fixationData from "../data/fixation_data.json";
import visualizationData from "../data/visualization_data.json";
import GenerateImgUrl from "./GenerateImgUrl.module";

class GazeVisualization extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPage: 0,
      previousCenter: null,
      imgUrls: [],
    };
    this.canvasRefs = visualizationData.map(() => React.createRef());
    this.animationFrameId = null;
  }

  async componentDidMount() {
    console.log(visualizationData);

    // 이미지 URL 가져오기
    const imgUrls = await Promise.all(
      visualizationData.map(async (page) => {
        console.log("s_num, f_num", page.s_num, page.f_num);
        return await GenerateImgUrl(page.s_num, page.f_num);
      })
    );

    this.setState({ imgUrls }, () => {
      this.animationFrameId = requestAnimationFrame(() => {
        this.drawFixations();
      });
    });
  }

  componentWillUnmount() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  drawFixations = async () => {
    const { currentPage } = this.state;
    const canvas = this.canvasRefs[currentPage].current; // 현재 페이지의 Canvas 참조 가져오기

    /**canvas가 null일때 아직 랜더링되지 않았으므로 재시도한다. */
    if (!canvas) {
      this.animationFrameId = requestAnimationFrame(() => {
        this.drawFixations();
      });
      return;
    }

    const ctx = canvas.getContext("2d");
    const { fixations } = visualizationData[currentPage];

    const screenAspectRatio = 1080 / 2195;
    const canvasWidth = canvas.width;
    const canvasHeight = canvasWidth / screenAspectRatio;

    console.log(
      "canvas, canvasWidth, canvasHeight",
      canvas,
      canvasWidth,
      canvasHeight
    );

    ctx.globalAlpha = 0.5;
    const img = new Image();
    img.src = this.state.imgUrls[currentPage];
    img.onload = function () {
      ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
    };

    // canvas.style.border = "1px solid #000";

    const animateFixations = (fixationIndex) => {
      console.log("fixations", fixations);

      if (fixationIndex >= fixations.length) {
        /**현재 페이지의 모든 fixations를 그렸다면 다음 페이지로 넘어가기 */
        if (currentPage < visualizationData.length - 1) {
          this.setState(
            { currentPage: currentPage + 1, previousCenter: null },
            () => {
              this.animationFrameId = requestAnimationFrame(() => {
                this.drawFixations();
              });
            }
          );
        }
        return;
      }

      const fixation = fixations[fixationIndex];
      // const { cx, cy, st, et, r } = fixation;
      const { x, y, d } = fixation;
      // const duration = et - st;

      const interval = 100; // 실제 속도

      // const scaleFactor = 2;
      const steps = parseInt(d / 100);
      const stepDuration = d / steps;

      let step = 0;
      let currentRadius = 0;

      const drawStep = () => {
        if (step >= steps) {
          if (this.state.previousCenter) {
            ctx.globalCompositeOperation = "source-over";
            ctx.beginPath();
            ctx.moveTo(
              this.state.previousCenter.x,
              this.state.previousCenter.y
            );
          }
          setTimeout(() => {
            animateFixations(fixationIndex + 1);
          }, interval);
          return;
        }

        const progress = step / steps;

        const newX = (x / 1080) * canvasWidth;
        const newY = (y / 2195) * canvasHeight;
        const radius = 10 * step * progress;
        // const radius = r * progress * scaleFactor;

        // ctx.clearRect(0, 0, canvas.width, canvas.height);

        /**이전 fixation과 현재 fixation을 연결하는 선 그리기 */
        if (this.state.previousCenter) {
          ctx.globalCompositeOperation = "source-over";
          ctx.beginPath();
          ctx.moveTo(this.state.previousCenter.x, this.state.previousCenter.y);
          ctx.lineTo(newX, newY);
          ctx.strokeStyle = "#d11507";
          ctx.stroke();
        }

        /**원 그리기 */
        ctx.globalAlpha = 0.5; // 투명도 50%
        ctx.globalCompositeOperation = "source-over";
        // ctx.beginPath();
        if (step === 0) {
          ctx.beginPath();
          ctx.arc(newX, newY, radius, 0, 2 * Math.PI);
          ctx.fillStyle = "#d11507";
          ctx.fill();
          // ctx.strokeStyle = "#d11507";
          // ctx.stroke();
        } else {
          // ctx.clearRect(
          //   newX - currentRadius,
          //   newY - currentRadius,
          //   currentRadius * 2,
          //   currentRadius * 2
          // );
          ctx.beginPath();
          ctx.arc(newX, newY, currentRadius, 0, 2 * Math.PI);
          ctx.arc(newX, newY, currentRadius - 5, 0, 2 * Math.PI);
          ctx.fillStyle = "rgba(209,21,7)";
          ctx.fill();
          // ctx.strokeStyle = "#d11507";
          // ctx.stroke();
        }
        // ctx.arc(newX, newY, radius, 0, 2 * Math.PI);
        // ctx.fillStyle = "#d11507";
        // ctx.fill();
        // ctx.strokeStyle = "#d11507";
        // ctx.stroke();

        step++;
        currentRadius += 10;

        setTimeout(drawStep, stepDuration);
      };

      drawStep();

      this.setState({
        previousCenter: {
          x: (x / 1080) * canvasWidth,
          y: (y / 2195) * canvasHeight,
        },
      });
    };

    animateFixations(0);
  };

  render() {
    return (
      <div style={{ display: "flex", overflowX: "scroll" }}>
        {visualizationData.map((pageData, index) => (
          <canvas
            key={index}
            ref={this.canvasRefs[index]}
            width={1080}
            height={2195}
            style={{
              border: "1px solid #000",
              margin: "10px",
            }}
          ></canvas>
        ))}
      </div>
    );
  }
}

export default GazeVisualization;
