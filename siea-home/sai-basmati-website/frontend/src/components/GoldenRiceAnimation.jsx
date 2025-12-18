import React, { useEffect, useRef } from "react";

const GoldenRiceAnimation = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let hue = 45; 

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 7 + 5; // 5 → 12px rice
        this.speedX = Math.random() * 0.8 + 0.3;
        this.speedY = Math.random() * 0.4 - 0.2;
        this.alpha = Math.random() * 0.6 + 0.4;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.01;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;

        if (
          this.x > canvas.width + 50 ||
          this.y < -50 ||
          this.y > canvas.height + 50
        ) {
          this.reset();
          this.x = -20;
        }
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        
        ctx.fillStyle = `hsla(${hue}, 90%, 55%, ${this.alpha})`;
        ctx.shadowColor = `hsla(${hue}, 100%, 60%, 1)`;
        ctx.shadowBlur = 15;

        ctx.beginPath();
        ctx.ellipse(
          0,
          0,
          this.size * 0.25,
          this.size,
          Math.PI / 4,
          0,
          Math.PI * 2
        );
        ctx.fill();

        ctx.restore();
      }
    }

    const particles = [];
    for (let i = 0; i < 300; i++) particles.push(new Particle());

    function drawBackground() {
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, "#000000");
      gradient.addColorStop(0.5, "#111111");
      gradient.addColorStop(1, "#000000");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function animate() {
      drawBackground();

      hue += 0.3;
      if (hue > 55) hue = 45;

      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="block w-full h-full"
    />
  );
};

export default GoldenRiceAnimation;
