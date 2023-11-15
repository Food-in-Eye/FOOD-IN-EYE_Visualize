import React, { Component } from "react";
import fixationData from "../data/fixation_data.json";

class GazeVisualization extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPage: 0,
    };
    this.canvasRefs = fixationData.map(() => React.createRef());
    this.animationFrameId = null; // requestAnimationFrame의 ID를 저장하기 위한 변수
  }

  componentDidMount() {
    // Canvas 요소의 렌더링을 기다립니다.
    this.animationFrameId = requestAnimationFrame(() => {
      this.drawFixations();
    });
  }

  componentWillUnmount() {
    // 컴포넌트가 언마운트될 때 requestAnimationFrame을 정리합니다.
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  clearCanvas(canvas) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  drawFixations() {
    const { currentPage } = this.state;
    const canvas = this.canvasRefs[currentPage].current;

    if (!canvas) {
      // Canvas가 null이면 아직 렌더링되지 않았으므로 재시도합니다.
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

    canvas.style.border = "1px solid #000";

    const animateFixations = (fixationIndex) => {
      if (fixationIndex >= fixations.length) {
        if (currentPage < fixationData.length - 1) {
          // 현재 페이지의 Canvas를 비우고
          this.clearCanvas(canvas);
          this.setState({ currentPage: currentPage + 1 }, () => {
            // 다음 페이지로 이동한 후 다시 시각화합니다.
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
      const interval = 1000;

      const animate = () => {
        const now = Date.now();
        const elapsed = now - st;
        const progress = Math.min(1, elapsed / duration);

        const x = (cx / 1080) * canvasWidth;
        const y = (cy / 2195) * canvasHeight;

        ctx.globalCompositeOperation = "source-over";
        ctx.beginPath();
        ctx.arc(x, y, r * progress, 0, 2 * Math.PI);
        ctx.fillStyle = "blue";
        ctx.fill();

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setTimeout(() => {
            animateFixations(fixationIndex + 1);
          }, interval);
        }
      };

      requestAnimationFrame(animate);
    };

    animateFixations(0);
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
            style={{ border: "1px solid #000", marginRight: "10px" }}
          ></canvas>
        ))}
      </div>
    );
  }
}

export default GazeVisualization;
