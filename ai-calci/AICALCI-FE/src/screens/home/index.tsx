import { useEffect, useRef, useState } from 'react';
import {SWATCHES} from '@/constants';
import { ColorSwatch, Group } from '@mantine/core';
import {Button} from '@/components/ui/button';
import axios from 'axios';
import { StringToBoolean } from 'class-variance-authority/types';

interface Response {
    expr: string;
    result: String;
    assign: boolean;
}

interface GeneratedResult {
    expression: string;
    answer: string;
}

export default function Home() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] =  useState('rgb(255,255,255');
    const [reset , setReset] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false); // State to toggle between normal and expanded view
    const [result, setResult] = useState<GeneratedResult>();
    const [dictofVars, setDictofVars] = useState({});

    useEffect(() =>{
        if (reset) {
            resetCanvas();
            setReset(false);
        }
    }, [reset]);

    useEffect(() => {
        const canvas = canvasRef.current;

        const updateCanvasSize = () => {
            if (canvas) {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    // Set the canvas size based on whether the blackboard is expanded or not
                    const canvasWidth = isExpanded ? window.innerWidth * 0.95 : window.innerWidth * 0.90; // 95% width when expanded, 90% when normal
                    const canvasHeight = isExpanded ? window.innerHeight * 0.9 : window.innerHeight * 0.5; // 90% height when expanded, 50% when normal
                    canvas.width = canvasWidth;
                    canvas.height = canvasHeight;

                    ctx.lineCap = 'round';
                    ctx.lineWidth = 5;
                    ctx.fillStyle = '#2D2D2D'; // Dark greenish-black like a vintage blackboard
                    ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill the canvas with the blackboard color
                }
            }
        };

        // Set the initial canvas size
        updateCanvasSize();

        // Update canvas size on window resize
        window.addEventListener('resize', updateCanvasSize);

        // Cleanup on component unmount
        return () => {
            window.removeEventListener('resize', updateCanvasSize);
        };
    }, [isExpanded]); // Dependency array ensures the effect runs when the `isExpanded` state changes
    
    const sendData = async () => {
        const canvas = canvasRef.current;

        if(canvas){
            const response = await axios({
                method: 'post',
                url: ' ${import.meta.env.VITE_API_URL}/calculate',
                data:{
                    image: canvas.toDataURL('imag/png'),
                    dict_of_vars: dictofVars,
                }
            });

            const resp = await response.data;
            console.log('Response: ', resp);
        }
    };


    const resetCanvas = () =>{
        const canvas = canvasRef.current;
        if(canvas){
            const ctx =canvas.getContext('2d');
            if(ctx){
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
    };

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            const canvasRect = canvas.getBoundingClientRect(); // Get canvas position relative to viewport

            // Use offsetX and offsetY for precise mouse position relative to the canvas
            const x = e.nativeEvent.offsetX;
            const y = e.nativeEvent.offsetY;

            if (ctx) {
                ctx.beginPath();
                ctx.moveTo(x, y); // Start drawing at the correct position
                setIsDrawing(true);
            }
        }
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;

        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');

            const x = e.nativeEvent.offsetX;
            const y = e.nativeEvent.offsetY;

            if (ctx) {
                ctx.strokeStyle = color; // Light chalky white color
                ctx.lineTo(x, y); // Draw directly using correct coordinates
                ctx.stroke();
            }
        }
    };

    // Toggle expanded mode (expanding the canvas)
    const toggleExpandMode = () => {
        setIsExpanded((prev) => !prev);
    };

    return (
        <>
            <div
                style={{
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    width: '100%',
                    height: '100%',
                    background: 'url("/modern-empthy-classroom-background-vector.jpg")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundAttachment: 'fixed',
                    zIndex: -1,
                }}
            />
            <button
                onClick={toggleExpandMode}
                style={{
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    padding: '10px 20px',
                    backgroundColor: '#6E4B3A',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    zIndex: 1,
                }}
            >
                {isExpanded ? 'Shrink Blackboard' : 'Expand Blackboard'}
            </button>

            <div className='grid grid-cols-3 gap-2'>
                <Button
                    onClick={()=> setReset(true)}
                    className='z-20 bg-black text-white'
                    variant='default'
                    color='black'
                >
                    Reset
                </Button>
                <Group className='z-20'>
                    {SWATCHES.map((swatchColor: string) => (
                        <ColorSwatch
                            key={swatchColor}
                            color={swatchColor}
                            onClick={()=> setColor(swatchColor)}
                        />
                    ))}
                </Group>
                <Button
                    onClick={sendData}
                    className='z-20 bg-black text-white'
                    variant='default'
                    color='black'
                >
                    Calculate
                </Button>

            </div>

            <canvas
                ref={canvasRef}
                id="canvas"
                className="absolute top-0 left-0"
                onMouseDown={startDrawing}
                onMouseUp={stopDrawing}
                onMouseMove={draw}
                onMouseLeave={stopDrawing}
                style={{
                    position: 'absolute',
                    top: '5%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    border: '10px solid #6E4B3A',
                    borderRadius: '8px',
                    boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.5)',
                    backgroundColor: '#2D2D2D',
                    overflow: 'hidden',
                    cursor: 'url("/126616.png"), auto',
                }}
            />
        </>
    );
}
