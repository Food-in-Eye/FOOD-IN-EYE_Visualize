import React, { Component } from "react";
import visualizationData from "../data/visualization_data.json";
import GenerateImgUrl from "./GenerateImgUrl.module";
import Style from "../css/style.module.css";

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
          console.log("fixations가 없을 때1");
          setTimeout(this.moveToNextCanvas, 2000);
        }
      };
    } else {
      if (fixations.length > 0) {
        this.drawFixations(fixations, ctx, canvasWidth, canvasHeight);
      } else {
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
      <div className={Style.canvasDiv}>
        <canvas
          ref={this.canvasRef}
          width={1080}
          height={2195}
          style={{
            border: "1px solid #000",
            margin: "10px",
          }}
        ></canvas>
      </div>
    );
  }
}

export default GazeVisualization;
