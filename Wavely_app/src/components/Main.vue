<script>
// Дополнительная анимация для улучшения эффекта жидкости
        document.addEventListener('DOMContentLoaded', function() {
            const blobs = document.querySelectorAll('.blob');
            
            // Добавляем случайное движение для большего эффекта жидкости
            setInterval(() => {
                blobs.forEach(blob => {
                    const randomX = Math.random() * 20 - 10;
                    const randomY = Math.random() * 20 - 10;
                    const randomScale = 0.95 + Math.random() * 0.1;
                    
                    blob.style.transform = `translate(${randomX}px, ${randomY}px) scale(${randomScale})`;
                });
            }, 3000);
            
            // Эффект при наведении на кнопку
            const generateBtn = document.querySelector('.generate-btn');
            generateBtn.addEventListener('mouseenter', function() {
                document.querySelectorAll('.blob').forEach(blob => {
                    blob.style.filter = 'blur(30px) brightness(1.2)';
                });
            });
            
            generateBtn.addEventListener('mouseleave', function() {
                document.querySelectorAll('.blob').forEach(blob => {
                    blob.style.filter = 'blur(40px)';
                });
            });
        });
</script>

<template>
    <div class="background-container">
        <img src="../assets/Background.png" alt="Фон" class="background-image">
    </div>

    <div class="liquid-bg">
        <div class="blob"></div>
        <div class="blob"></div>
        <div class="blob"></div>
        <div class="blob"></div>
    </div>
</template>

<style>        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        body {
            color: white;
            min-height: 100vh;
            overflow-x: hidden;
            position: relative;
        }

        .background-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -2;
            overflow: hidden;
        }

        .background-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
            opacity: 0.9;
        }

        .liquid-bg {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            overflow: hidden;
        }

        .blob {
            position: absolute;
            border-radius: 50%;
            filter: blur(40px);
            opacity: 0.6;
            animation: float 15s infinite ease-in-out;
            mix-blend-mode: overlay;
        }

        .blob:nth-child(1) {
            background: linear-gradient(135deg, #ffffff, #6ad7f5);
            width: 500px;
            height: 500px;
            top: -100px;
            left: -100px;
            animation-delay: 0s;
        }

        .blob:nth-child(2) {
            background: linear-gradient(135deg, #6b9efc, #c74ce4);
            width: 600px;
            height: 600px;
            bottom: -150px;
            right: -100px;
            animation-delay: -5s;
        }

        .blob:nth-child(3) {
            background: linear-gradient(135deg, #c74ce4, #6af5cb);
            width: 400px;
            height: 400px;
            bottom: 50%;
            right: 30%;
            animation-delay: -10s;
        }

        .blob:nth-child(4) {
            background: linear-gradient(135deg, #6af5cb, #5b6eff);
            width: 350px;
            height: 350px;
            top: 40%;
            left: 10%;
            animation-delay: -7s;
        }

        @keyframes float {
            0%, 100% {
                transform: translate(0, 0) scale(1);
                border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
            }
            25% {
                transform: translate(50px, -50px) scale(1.05);
                border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
            }
            50% {
                transform: translate(0, -100px) scale(1.1);
                border-radius: 40% 60% 70% 30% / 40% 40% 60% 50%;
            }
            75% {
                transform: translate(-50px, -50px) scale(1.05);
                border-radius: 70% 30% 50% 50% / 30% 30% 70% 70%;
            }
        }

        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            text-align: center;
            position: relative;
            z-index: 1;
        }

        .logo {
            font-size: 3.5rem;
            font-weight: 700;
            margin-bottom: 20px;
            background: linear-gradient(135deg, #ff5e7d, #ffcb57);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            text-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }

        .tagline {
            font-size: 1.2rem;
            margin-bottom: 40px;
            opacity: 0.9;
            line-height: 1.6;
        }

        .prompt-box {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.1);
            margin-bottom: 30px;
        }

        .prompt-box h2 {
            font-size: 1.8rem;
            margin-bottom: 20px;
            font-weight: 600;
        }

        .prompt-input {
            width: 100%;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            padding: 15px 20px;
            color: white;
            font-size: 1rem;
            margin-bottom: 20px;
            transition: all 0.3s ease;
        }

        .prompt-input:focus {
            outline: none;
            border-color: rgba(255, 255, 255, 0.4);
            box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
        }

        .prompt-input::placeholder {
            color: rgba(255, 255, 255, 0.6);
        }

        .generate-btn {
            background: linear-gradient(135deg, #ff5e7d, #ffcb57);
            border: none;
            border-radius: 12px;
            padding: 15px 40px;
            color: white;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 10px 20px rgba(255, 94, 125, 0.3);
        }

        .generate-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 15px 25px rgba(255, 94, 125, 0.4);
        }

        .info-text {
            font-size: 0.9rem;
            opacity: 0.7;
            margin-top: 30px;
        }

        @media (max-width: 768px) {
            .logo {
                font-size: 2.5rem;
            }
            
            .prompt-box {
                padding: 30px 20px;
            }
            
            .blob {
                transform: scale(0.7);
            }
        }
</style>