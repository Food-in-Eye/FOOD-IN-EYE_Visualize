import React, { Component } from "react";
import fixationData from "../data/fixation_data.json";

class GazeVisualization extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPage: 0,
    };
    this.canvasRefs = fixationData.map(() => React.createRef());
    this.animationFrameId = null;
  }

  componentDidMount() {
    console.log(fixationData);
    this.animationFrameId = requestAnimationFrame(() => {
      this.drawFixations();
    });
  }

  componentWillUnmount() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  drawFixations() {
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

    // canvas.style.border = "1px solid #000";

    const animateFixations = (fixationIndex) => {
      console.log("fixations", fixations);

      if (fixationIndex >= fixations.length) {
        /**현재 페이지의 모든 fixations를 그렸다면 다음 페이지로 넘어가기 */
        if (currentPage < fixationData.length - 1) {
          this.setState({ currentPage: currentPage + 1 }, () => {
            this.animationFrameId = requestAnimationFrame(() => {
              this.drawFixations();
            });
          });
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
          setTimeout(() => {
            animateFixations(fixationIndex + 1);
          }, interval);
          return;
        }

        const progress = step / steps;

        const x = (cx / 1080) * canvasWidth;
        const y = (cy / 2195) * canvasHeight;

        /**원 그리기 */
        ctx.globalCompositeOperation = "source-over";
        ctx.beginPath();
        ctx.arc(x, y, r * progress * scaleFactor, 0, 2 * Math.PI);
        ctx.fillStyle = "blue";
        ctx.fill();

        step++;

        setTimeout(drawStep, stepDuration);
      };

      drawStep();
    };

    animateFixations(0);

    //   const animate = () => {
    //     const now = Date.now();
    //     const elapsed = now - st;
    //     const progress = Math.min(1, elapsed / duration);

    //     console.log("Animating frame for fixation index", fixationIndex);
    //     console.log("Now:", now);
    //     console.log("Elapsed:", elapsed);
    //     console.log("Progress:", progress);

    //     /**화면 크기에 맞게 좌표 변환 */
    //     const x = (cx / 1080) * canvasWidth;
    //     const y = (cy / 2195) * canvasHeight;

    //     /**원 그리기 */
    //     ctx.globalCompositeOperation = "source-over";
    //     ctx.beginPath();
    //     ctx.arc(x, y, r * progress * scaleFactor, 0, 2 * Math.PI);
    //     ctx.fillStyle = "blue";
    //     ctx.fill();

    //     if (progress < 1) {
    //       requestAnimationFrame(animate);
    //     } else {
    //       setTimeout(() => {
    //         animateFixations(fixationIndex + 1);
    //       }, interval);
    //     }
    //   };

    //   requestAnimationFrame(animate);
    // };

    // animateFixations(0);
  }

  render() {
    return (
      <div style={{ display: "flex", overflowX: "scroll" }}>
        {fixationData.map((pageData, index) => (
          <canvas
            key={index}
            ref={this.canvasRefs[index]}
            width={1080}
            height={2195}
            style={{ border: "1px solid #000", margin: "10px" }}
          ></canvas>
        ))}
      </div>
    );
  }
}

export default GazeVisualization;
