import React, { Component } from "react";
import fixationData from "../data/fixation_data.json";
import GenerateImgUrl from "./GenerateImgUrl.module";

class GazeVisualization extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPage: 0,
      previousCenter: null,
      imgUrls: [],
    };
    this.canvasRefs = fixationData.map(() => React.createRef());
    this.animationFrameId = null;
  }

  async componentDidMount() {
    console.log(fixationData);

    // 이미지 URL 가져오기
    const imgUrls = await Promise.all(
      fixationData.map(async (page) => {
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
    const { fixations } = fixationData[currentPage];

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
        if (currentPage < fixationData.length - 1) {
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
      const { cx, cy, st, et, r } = fixation;
      const duration = et - st;
      const interval = 100;

      const scaleFactor = 2;
      const steps = 10;
      const stepDuration = duration / steps;

      let step = 0;
      //   let currentRadius = 0;

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

        const x = (cx / 1080) * canvasWidth;
        const y = (cy / 2195) * canvasHeight;
        const radius = r * progress * scaleFactor;

        // ctx.clearRect(0, 0, canvas.width, canvas.height);

        /**이전 fixation과 현재 fixation을 연결하는 선 그리기 */
        if (this.state.previousCenter) {
          ctx.globalCompositeOperation = "source-over";
          ctx.beginPath();
          ctx.moveTo(this.state.previousCenter.x, this.state.previousCenter.y);
          ctx.lineTo(x, y);
          ctx.strokeStyle = "#d11507";
          ctx.stroke();
        }

        /**원 그리기 */
        ctx.globalAlpha = 0.5; // 투명도 50%
        ctx.globalCompositeOperation = "source-over";
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = "#d11507";
        ctx.fill();
        ctx.strokeStyle = "#d11507";
        ctx.stroke();

        step++;

        setTimeout(drawStep, stepDuration);
      };

      drawStep();

      this.setState({
        previousCenter: {
          x: (cx / 1080) * canvasWidth,
          y: (cy / 2195) * canvasHeight,
        },
      });
    };

    animateFixations(0);
  };

  render() {
    const { imgUrls } = this.state;

    return (
      <div style={{ display: "flex", overflowX: "scroll" }}>
        {fixationData.map((pageData, index) => (
          <canvas
            key={index}
            ref={this.canvasRefs[index]}
            width={1080}
            height={2195}
            style={{
              border: "1px solid #000",
              margin: "10px",
              // backgroundImage: `url(${imgUrls[index]})`,
              // backgroundSize: "cover",
            }}
          ></canvas>
        ))}
      </div>
    );
  }
}

export default GazeVisualization;
