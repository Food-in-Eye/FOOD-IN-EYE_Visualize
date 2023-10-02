import React, { Component } from "react";
import fixationData from "../data/fixation_data.json";

class GazeVisualization extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fixations: [],
    };
    this.canvasRef = React.createRef();
  }

  componentDidMount() {
    console.log(fixationData);
    const { fixations } = fixationData[0]; // fixationData[0]에서 fixations 배열을 추출합니다.
    this.setState({ fixations }, () => {
      this.drawFixations();
    });
    // this.setState({ fixations: fixationData[0].fixations });
    // this.drawFixations();
  }

  drawFixations() {
    const canvas = this.canvasRef.current;
    const ctx = canvas.getContext("2d");
    const { fixations } = this.state;

    const screenAspectRatio = 1080 / 2195;
    const canvasWidth = canvas.width;
    const canvasHeight = canvasWidth / screenAspectRatio;

    console.log(
      "canvas, canvasWidth, canvasHeight",
      canvas,
      canvasWidth,
      canvasHeight
    );

    const animateFixations = (fixationIndex) => {
      console.log("fixations", fixations);

      if (fixationIndex >= fixations.length) {
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

        console.log("Animating frame for fixation index", fixationIndex);
        console.log("Now:", now);
        console.log("Elapsed:", elapsed);
        console.log("Progress:", progress);

        // ctx.clearRect(0, 0, canvas.width, canvas.height);

        /**화면 크기에 맞게 좌표 변환 */
        const x = (cx / 1080) * canvasWidth;
        const y = (cy / 2195) * canvasHeight;

        /**원 그리기 */
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

      //   setTimeout(() => {
      //     animate();
      //     requestAnimationFrame(animate);
      //   }, (st - fixations[0].st) * 0.1);
    };

    animateFixations(0);
  }

  render() {
    return (
      <canvas
        ref={this.canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
      ></canvas>
    );
  }
}

export default GazeVisualization;
