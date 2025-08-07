import React, { Component, useEffect, useRef } from 'react';
import rpc from 'utils/rpc';
import classNames from 'classnames';
// @ts-ignore
import AnimatedNumber from 'animated-number-react';
import Fraction from './Fraction';
import sprite from 'assets/images/icons.svg'; // Path to your SVG icon file


type Props = {
    binds: {
        [name: string]: string;
    };
};
type State = typeof initialState;
type StateIcons = typeof initialIcons;

const initialState = {
    inVehicle: false,
    velocity: 0,
    maxspeed: 250,
    rpm: 0

};

const initialIcons = {
    engine: {
        health: 100,
        active: false
    },
    fuel: {
        current: 0,
        max: 100
    },
    locked: false,
    seatbelt: false,
    lung: 0,
    scurt: 0,
    dooro: 0,
    brake: 0,
    rightl: false,
    leftl: false,
    cruise: false
}

// Helper functions
const deg2Rad = (deg: number): number => deg * (Math.PI / 180);
const rad2Deg = (rad: number): number => rad * (180 / Math.PI);

// Interface definitions
interface IconProps {
    offsetX: number; // Offset in px from center of circle by x-coordinate.
    offsetY: number; // Offset in px from center of circle by y-coordinate.
    spritePosX: number; // Position of icon in px in the icons sprite by x-coordinate.
    spritePosY: number; // Position of icon in px in the icons sprite by y-coordinate.
    width: number; // Width of icon.
    height: number; // Height of icon.
    states: number; // States of icon (1 - Off, 2 - Warning, 3 - Critical/On).
}

interface SpeedoCircleOptions {
    circleBorderWidth: number;
    circleBorderColor: string;
    circleFillColor: string;
    markFillColor: string;
    markStrokeColor: string;
    markFontColor: string;
    markFontSize: number;
    markFontStyle: string;
    markFontFamily: string;
    arrowBodyFillColor: string;
    arrowBodyStrokeColor: string;
    arrowColor: string;
    arrowBaseWidth: number;
    arrowBorderWidth: number;
    dangerColor: string;
    dangerZoneWidth: number;
    turnSignalColor: string;
    speedUnit: string;
    icons: Record<string, Icon>;
    turnSignal: { left: any; right: any };
    supportColor: string;
}

// Class representing a Circle
class SpeedoCircle {
    circleBorderWidth: number;
    circleBorderColor: string;
    circleFillColor: string;
    markFillColor: string;
    markStrokeColor: string;
    markFontColor: string;
    markFontSize: number;
    markFontStyle: string;
    markFontFamily: string;
    arrowBodyFillColor: string;
    arrowBodyStrokeColor: string;
    arrowColor: string;
    arrowBaseWidth: number;
    arrowBorderWidth: number;
    dangerColor: string;
    dangerZoneWidth: number;
    turnSignalColor: string;
    speedUnit: string;
    icons: Record<string, Icon>;
    turnSignal: { left: any; right: any };
    supportColor: string;
    startAngle: number;
    endAngle: number;
    radius: number;
    x: number;
    y: number;
    textMarksOffsetX: number; 
    textMarksOffsetY: number; 

    constructor(options: SpeedoCircleOptions, canvas: HTMLCanvasElement) {
        this.circleBorderWidth = options.circleBorderWidth;
        this.circleBorderColor = options.circleBorderColor;
        this.circleFillColor = options.circleFillColor;
        this.markFillColor = options.markFillColor;
        this.markStrokeColor = options.markStrokeColor;
        this.markFontColor = options.markFontColor;
        this.markFontSize = options.markFontSize;
        this.markFontStyle = options.markFontStyle;
        this.markFontFamily = options.markFontFamily;
        this.arrowBodyFillColor = options.arrowBodyFillColor;
        this.arrowBodyStrokeColor = options.arrowBodyStrokeColor;
        this.arrowColor = options.arrowColor;
        this.arrowBaseWidth = options.arrowBaseWidth;
        this.arrowBorderWidth = options.arrowBorderWidth;
        this.dangerColor = options.dangerColor;
        this.dangerZoneWidth = options.dangerZoneWidth;
        this.turnSignalColor = options.turnSignalColor;
        this.speedUnit = options.speedUnit;
        this.icons = options.icons;
        this.turnSignal = options.turnSignal;
        this.startAngle = 0;
        this.endAngle = Math.PI * 2;
        this.radius = canvas.height * 0.35;
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.supportColor = options.supportColor || 'red';
        this.textMarksOffsetX = 0; 
        this.textMarksOffsetY = 0; 
    }

    drawSupport(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
        ctx.beginPath();
        ctx.moveTo(this.x, 0);
        ctx.lineTo(this.x, canvas.height);
        ctx.moveTo(0, this.y);
        ctx.lineTo(canvas.width, this.y);
        ctx.closePath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = this.supportColor;
        ctx.stroke();
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, this.startAngle, this.endAngle);
        ctx.closePath();
        ctx.fillStyle = this.circleFillColor;
        ctx.lineWidth = this.circleBorderWidth;
        ctx.strokeStyle = this.circleBorderColor;
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }

    drawMultiplier(ctx: CanvasRenderingContext2D, multiplier: number, offsetY: number) {
        const value = `x${100 * multiplier} rpm`;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.font = `${this.markFontStyle} ${this.markFontSize / 1.75}px ${this.markFontFamily}`;
        ctx.fillStyle = this.markFontColor;
        ctx.fillText(value, -ctx.measureText(value).width / 2 - 6, offsetY - 2);
        ctx.restore();
    }

    calcMarksAngles(count: number, degAngle: number, startAngle: number = 0): number[] {
        const addAngle = deg2Rad((degAngle - 180) / 2);
        const radAngle = deg2Rad(degAngle);
        const angles: number[] = [];

        for (let i = 0; i < count; i++) {
            const angle = ((i * radAngle / (count - 1)) - addAngle - deg2Rad(startAngle)) * -1;
            angles.push(angle);
        }

        return angles;
    }

    drawDangerZone(ctx: CanvasRenderingContext2D, angles: number[], offset: number, firstNMarks: number = 0, lastNMarks: number = 0) {
        const radius = this.radius - this.circleBorderWidth - offset;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.beginPath();

        if (lastNMarks > 0) {
            ctx.arc(0, 0, radius, angles[lastNMarks - 1], angles[0], false);
        } else if (firstNMarks > 0) {
            ctx.arc(0, 0, radius, angles[firstNMarks - 1], angles[0], false);
        }

        ctx.lineWidth = this.dangerZoneWidth;
        ctx.strokeStyle = this.dangerColor;
        ctx.stroke();
        ctx.restore();
    }

    drawMark(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, lineWidth: number, strokeStyle: string) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.closePath();
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = strokeStyle;
        ctx.stroke();
    }

    drawMarks(ctx: CanvasRenderingContext2D, angles: number[], length: number, lineWidth: number, border = true, offset = 0, firstNMarks = 0, lastNMarks = 0, skip: 'even' | 'odd' | 'all' | null = null, skipFrom = 0, skipTo = 0) {
        const count = angles.length - 1;
        const s = count - firstNMarks;
        const e = count - lastNMarks;
        const sf = count - skipFrom;
        const st = count - skipTo;
        const radius = this.radius - this.circleBorderWidth - offset;

        ctx.save();
        ctx.translate(this.x, this.y);

        for (let angle of angles) {
            if (((skip === 'even' && (angles.indexOf(angle) % 2 === 1)) ||
                (skip === 'odd' && (angles.indexOf(angle) % 2 === 0)) ||
                (skip === 'all'))) {
                if ((sf >= angles.indexOf(angle)) && (angles.indexOf(angle) >= st)) {
                    continue;
                }
            }

            const x1 = Math.cos(angle) * radius;
            const y1 = Math.sin(angle) * radius;
            const x2 = Math.cos(angle) * (radius - (radius / length));
            const y2 = Math.sin(angle) * (radius - (radius / length));

            // Draw "border" for main mark
            if (border) {
                this.drawMark(ctx, x1, y1, x2, y2, lineWidth + 1, this.markStrokeColor);
            }

            // Draw main mark
            if ((lastNMarks > 0 && angles.indexOf(angle) < e) || (firstNMarks > 0 && angles.indexOf(angle) > s)) {
                this.drawMark(ctx, x1, y1, x2, y2, lineWidth, this.dangerColor);
            } else {
                this.drawMark(ctx, x1, y1, x2, y2, lineWidth, this.markFillColor);
            }
        }

        ctx.restore();
    }

    calcTextMarksAngles(count: number, degAngle: number, innerOffset: number, startAngle: number = 0): number[] {
        const addAngle = deg2Rad((degAngle + innerOffset - 180) / 2);
        const radAngle = deg2Rad(degAngle + innerOffset);
        const angles: number[] = [];

        for (let i = -count + 1; i <= 0; i++) {
            const angle = (i * radAngle / (count - 1)) + addAngle + deg2Rad(startAngle);
            angles.push(angle);
        }

        return angles;
    }

    drawTextMark(ctx: CanvasRenderingContext2D, value: number | string, x: number, y: number) {
        ctx.font = `${this.markFontStyle} ${this.markFontSize}px ${this.markFontFamily}`;
        ctx.fillStyle = this.markFontColor;
        ctx.fillText(value.toString(), x, y);
        ctx.fill();
    }

    drawTextMarks(ctx: CanvasRenderingContext2D, angles: number[], step: number, offset: number, fractions: boolean = false, reverse: boolean = false) {
        
        let value = 0;
        const radius = this.radius - this.circleBorderWidth - offset;

        if (reverse) {
            angles.reverse();
        }

        ctx.save();
        ctx.translate(this.x, this.y);

        for (let angle of angles) {
            const x = Math.cos(angle) * (radius - (radius / 2)) - this.textMarksOffsetX;
            const y = Math.sin(angle) * (radius - (radius / 2)) + this.textMarksOffsetY;

            this.drawTextMark(ctx, value, x, y);
            value += step;
        }

        ctx.restore();
    }

    drawArrowBody(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.beginPath();
        ctx.arc(0, 0, this.radius / 7.5, 0, Math.PI * 2);
        ctx.closePath();
        ctx.lineWidth = this.radius / 7.5 / 2.5;
        ctx.strokeStyle = this.arrowBodyStrokeColor;
        ctx.fillStyle = this.arrowBodyFillColor;
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }

    drawArrow(ctx: CanvasRenderingContext2D, value: number, degAngle: number, offset: number = 0, startAngle: number = 0) {
        const addAngle = deg2Rad((degAngle * -1 - 180) / 2);
        const radAngle = deg2Rad(degAngle * -1);
        const angle = ((value * radAngle) - addAngle - deg2Rad(startAngle)) * -1;
        const radius = this.radius - this.circleBorderWidth - offset;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(0, -this.arrowBaseWidth);
        ctx.lineTo(radius, 0);
        ctx.lineTo(0, this.arrowBaseWidth);
        ctx.fillStyle = this.arrowColor;
        ctx.strokeStyle = this.arrowColor;
        ctx.lineWidth = this.arrowBorderWidth;
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }

    drawIcon(ctx: CanvasRenderingContext2D, icon: string, state: number = 0) {
        const img = new Image();
        img.src = sprite;

        img.onload = () => {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.drawImage(
                img,
                this.icons[icon].position.x + 150 * state + 10 * state,
                this.icons[icon].position.y,
                150,
                150,
                -this.icons[icon].dimensions.width / 2 + this.icons[icon].offset.x,
                -this.icons[icon].dimensions.height / 2 + this.icons[icon].offset.y,
                this.icons[icon].dimensions.width,
                this.icons[icon].dimensions.height
            );
            ctx.restore();
        };
    }

    drawTurnSignal(ctx: CanvasRenderingContext2D, offsetX: number, offsetY: number, width: number, height: number, enabled: boolean = false) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY - height + height * 0.25);
        ctx.lineTo(offsetX + width - width / 1.35, offsetY - height + height * 0.25);
        ctx.lineTo(offsetX + width - width / 1.35, offsetY - height);
        ctx.lineTo(offsetX + width - width / 2.5, offsetY - height / 2);
        ctx.lineTo(offsetX + width - width / 1.35, offsetY);
        ctx.lineTo(offsetX + width - width / 1.35, offsetY - height + height * 0.75);
        ctx.lineTo(offsetX, offsetY - height + height * 0.75);
        ctx.closePath();
        ctx.fillStyle = '#161616';
        if (enabled) {
            ctx.fillStyle = this.turnSignalColor;
        }
        ctx.fill();
        ctx.restore();
    }

    drawMileage(ctx: CanvasRenderingContext2D, value: number, offsetX: number, offsetY: number, width: number, height: number, radius: number) {
        const halfWidth = width / 2;
        const halfRadius = radius / 2;

        const xPhw = offsetX + halfWidth;
        const xMhw = offsetX - halfWidth;

        const xMhwPr = xMhw + radius;
        const xPhwMr = xPhw - radius;

        const xPhwMhr = xPhw - halfRadius;
        const xMhwPhr = xMhw + halfRadius;

        const yPh = offsetY + height;

        const yPr = offsetY + radius;

        const yPhr = offsetY + halfRadius;

        const yPhMhr = yPh - halfRadius;

        const yPhMr = yPh - radius;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.beginPath();
        ctx.moveTo(offsetX, yPh);
        ctx.lineTo(xPhwMr, yPh);
        ctx.bezierCurveTo(xPhwMr, yPh, xPhwMhr, yPhMhr, xPhw, yPhMr);
        ctx.lineTo(xPhw, yPr);
        ctx.bezierCurveTo(xPhw, yPr, xPhwMhr, yPhr, xPhwMr, offsetY);
        ctx.lineTo(xMhwPr, offsetY);
        ctx.bezierCurveTo(xMhwPr, offsetY, xMhwPhr, yPhr, xMhw, yPr);
        ctx.lineTo(xMhw, yPhMr);
        ctx.bezierCurveTo(xMhw, yPhMr, xMhwPhr, yPhMhr, xMhwPr, yPh);
        ctx.closePath();
        ctx.fillStyle = "#2b2b2b";
        ctx.fill();

        const displayValue = `${value} ${this.speedUnit}`;
        //value = `${value} ${this.speedUnit}`;

        ctx.font = `normal ${height - 6}px ${this.markFontFamily}`;
        ctx.fillStyle = this.markFontColor;
        ctx.fillText(displayValue, halfWidth - ctx.measureText(displayValue).width - 4, yPh - 5);
        ctx.restore();
    }

    drawUnit(ctx: CanvasRenderingContext2D, offsetX: number, offsetY: number) {
        const value = `${this.speedUnit}/h`;
        //const value = `${this.speedUnit}`;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.font = `${this.markFontStyle} ${this.markFontSize}px ${this.markFontFamily}`;
        ctx.fillStyle = this.markFontColor;
        ctx.fillText(value, (-ctx.measureText(value).width / 2)-offsetX, offsetY - 2);
        ctx.restore();
    }

    drawKilo(ctx: CanvasRenderingContext2D, val: number, offsetX: number, offsetY: number) {
        //const value = `${this.speedUnit}/h`;
        const value = `${val}`;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.font = `${this.markFontStyle} ${this.markFontSize}px ${this.markFontFamily}`;
        ctx.fillStyle = this.markFontColor;
        ctx.fillText(value, (-ctx.measureText(value).width / 2)-offsetX, offsetY - 2);
        ctx.restore();
    }

}

class MainCircle extends SpeedoCircle {
    constructor(options: SpeedoCircleOptions, canvas: HTMLCanvasElement) {
        super(options, canvas);
        this.startAngle = deg2Rad(130);
        this.endAngle = deg2Rad(50);
        let cw = canvas.width;
        let ch = canvas.height;
        this.radius = (ch / 2 +
            (ch / 2 - ch / 2 * Math.sin(deg2Rad(50))) / 2 -
            this.circleBorderWidth);
        this.x = cw / 2;
        this.y = (ch / 2 +
            (ch / 2 - this.radius * Math.sin(deg2Rad(50))) -
            this.circleBorderWidth);

        this.textMarksOffsetX = 12;
        this.textMarksOffsetY = 0;

        this.supportColor = 'red';
    }
}

class AdditionalCircle extends SpeedoCircle {
    constructor(options: SpeedoCircleOptions, side: 'left' | 'right', canvas: HTMLCanvasElement, mainCircleRadius: number) {
        super(options, canvas);

        const cw = canvas.width / 2;
        const x = cw - (cw -
            mainCircleRadius / 2 -
            this.radius -
            this.circleBorderWidth / 1.25);

        if (side === 'left') {
            this.x = cw - x;
        } else if (side === 'right') {
            this.x = cw + x;
        } else {
            throw 'Unknown circle side';
        }

        this.y = canvas.height / 2 + this.radius / 2 - this.circleBorderWidth * 2;

        this.textMarksOffsetX = 6;
        this.textMarksOffsetY = 2;

        this.supportColor = 'green';
    }
}

class TurnSignal {
    offset: { x: number; y: number };
    dimensions: { width: number; height: number };

    constructor(offsetX: number, offsetY: number, width: number, height: number) {
        this.offset = {
            x: offsetX,
            y: offsetY
        };
        this.dimensions = {
            width: width,
            height: height
        };
    }
}

class Icon {
    offset: { x: number; y: number };
    position: { x: number; y: number };
    dimensions: { width: number; height: number };
    states: number;

    constructor({offsetX, offsetY, spritePosX, spritePosY, width, height, states}: IconProps) {
        this.offset = {
            'x': offsetX,
            'y': offsetY
        }
        this.position = {
            'x': spritePosX,
            'y': spritePosY
        }
        this.dimensions = {
            'width': width,
            'height': height
        }
        this.states = states;
    }
}

class SpeedArrowDraw extends MainCircle {
    intervalId: ReturnType<typeof setInterval> | undefined;
    currentVelocity: number;  // Current velocity (the one being displayed)
    targetVelocity: number;    // Target velocity (the new velocity that we need to animate towards)
    animationDuration: number;  // Duration for the animation in milliseconds
    animationId: ReturnType<typeof setInterval> | undefined;

    // Add a canvas property directly in this class, to hold the reference
    private canvasSpeed: HTMLCanvasElement;

    constructor(options: SpeedoCircleOptions, canvasSpeed: HTMLCanvasElement, initialVelocity: number) {
        super(options, canvasSpeed);            // You might pass this if needed for the parent
        this.canvasSpeed = canvasSpeed;          // Assign the passed canvas to the local property
        this.currentVelocity = initialVelocity;  // Start with the initial velocity
        this.targetVelocity = initialVelocity;    // Set target velocity to start with
        this.animationDuration = 900;            // Set animation duration to 1000 ms
    }

    // Method to update target velocity and start animation
    updateVelocity(newTarget: number) {
        this.targetVelocity = newTarget; // Update the target velocity
        this.animateArrow();              // Start the animation
    }

    animateArrow() {
        const stepsCount = 20; // Number of steps for smooth transition
        const totalTime = this.animationDuration; // Total animation time in milliseconds
        const stepDuration = totalTime / stepsCount; // Duration for each step
        const step = (this.targetVelocity - this.currentVelocity) / stepsCount; // Calculate the step size

        this.animationId = setInterval(() => {
            if (Math.abs(this.currentVelocity - this.targetVelocity) < Math.abs(step)) {
                this.currentVelocity = this.targetVelocity; // Snap to target
                clearInterval(this.animationId);
            } else {
                this.currentVelocity += step; // Move towards the target
            }
            this.drawArrowOnCanvas(); // Redraw the arrow with the updated current velocity
        }, stepDuration); // Update every stepDuration milliseconds
    }

    drawArrowOnCanvas() {
        const ctxSpeed = this.canvasSpeed.getContext('2d'); // Use the canvasSpeed reference
        if (ctxSpeed) {
            ctxSpeed.clearRect(0, 0, this.canvasSpeed.width, this.canvasSpeed.height); // Clear canvas
            //super.draw(ctxSpeed); // Draw the main circle, if you have circle logic in Parent
            //const velocityInDegrees = this.currentVelocity * 360; // Convert velocity to degrees
            super.drawArrow(ctxSpeed, this.currentVelocity, 200, 20); // Call the inherited drawArrow method
            super.drawArrowBody(ctxSpeed); // Draw the arrow body
        }
    }
}

const Speedometer: React.FC<any> = (props) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const canvasSpeedRef = useRef<HTMLCanvasElement | null>(null);
    const speedArrowRef = useRef<SpeedArrowDraw | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d');

        const draw = () => {
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                const mainCircle = new MainCircle(props.options, canvas);
                
                drawLeftCircle(ctx, props.options, mainCircle.radius, props.tachometerValue, props.iconStates);
                drawRightCircle(ctx, props.options, mainCircle.radius, props.gasValue, props.iconStates);

                mainCircle.draw(ctx);
                const addMarksAngles = mainCircle.calcMarksAngles(10, 180);
                const mainMarksAngles = mainCircle.calcMarksAngles(11, 200);
                mainCircle.drawMarks(ctx, addMarksAngles, 7.5, 2, true, 4, 0, 0);
                mainCircle.drawMarks(ctx, mainMarksAngles, 7, 3, true, 3);
                //const textMarksAngles = mainCircle.calcTextMarksAngles(21, 200, 20);
                //mainCircle.drawTextMarks(ctx, textMarksAngles, 20, -40);
                if (props.iconStates["right"]) {
                    mainCircle.drawTurnSignal(ctx, 45, 0, 35, 15, props.options.turnSignal.left);
                }
                if (props.iconStates["left"]) {
                    mainCircle.drawTurnSignal(ctx, -45, 0, -35, 15, props.options.turnSignal.right);
                }
                
                mainCircle.drawIcon(ctx, 'dippedBeam', props.iconStates['dippedBeam']);
                mainCircle.drawIcon(ctx, 'brake', props.iconStates['brake']);
                mainCircle.drawIcon(ctx, 'drift', props.iconStates['drift']);
                mainCircle.drawIcon(ctx, 'highBeam', props.iconStates['highBeam']);
                mainCircle.drawIcon(ctx, 'doors', props.iconStates['doors']);
                mainCircle.drawIcon(ctx, 'lock', props.iconStates['lock']);
                mainCircle.drawIcon(ctx, 'seatBelt', props.iconStates['seatBelt']);
                mainCircle.drawIcon(ctx, 'engineTemp', props.iconStates['engineTemp']);
                mainCircle.drawIcon(ctx, 'stab', props.iconStates['stab']);
                mainCircle.drawIcon(ctx, 'abs', props.iconStates['abs']);

                mainCircle.drawMileage(ctx, props.mileage, 0, -55, 100, 20, 2);
                mainCircle.drawKilo(ctx, props.speedValue, 10, 80);
                mainCircle.drawUnit(ctx, -25, 80);
                //mainCircle.drawArrow(ctx, props.speedometerValue, 200, 20);
                //mainCircle.drawArrowBody(ctx);
            }
        };

        draw();
    }, [props]);

    useEffect(() => {
        const canvasSpeed = canvasSpeedRef.current!;
        speedArrowRef.current = new SpeedArrowDraw(props.options, canvasSpeed, props.speedometerValue);

        // Draw the initial state of the arrow
        speedArrowRef.current.drawArrowOnCanvas();

        return () => {
            if (speedArrowRef.current) {
                //speedArrowRef.current.componentWillUnmount(); // Clean up if necessary
            }
        };
    }, [props.options]);

    useEffect(() => {
        if (speedArrowRef.current) {
            speedArrowRef.current.updateVelocity(props.speedometerValue); // Update arrow when speedometerValue changes
        }
    }, [props.speedometerValue]); // Update velocity when speedometerValue changes

    const drawLeftCircle = (ctx: CanvasRenderingContext2D, options: SpeedoCircleOptions, radius: number, value: number, iconStates: Record<string, any>) => {
        const lCircle = new AdditionalCircle(options, 'left', canvasRef.current!, radius);
        lCircle.draw(ctx);

        const addMarksAngles = lCircle.calcMarksAngles(9, 140, 300);
        const mainMarksAngles = lCircle.calcMarksAngles(10, 160, 300);
        lCircle.drawDangerZone(ctx, addMarksAngles, 6, 0, 2);
        lCircle.drawDangerZone(ctx, mainMarksAngles, 6, 0, 2);

        lCircle.drawMarks(ctx, addMarksAngles, 7.5, 2, true, 1, 0, 2);
        lCircle.drawMarks(ctx, mainMarksAngles, 6, 3, true, 0, 0, 2);

        const textMarksAngles = lCircle.calcTextMarksAngles(10, 160, 5, 300);
        lCircle.drawTextMarks(ctx, textMarksAngles, 1, -18);

        lCircle.drawIcon(ctx, 'battery', iconStates['battery']);
        lCircle.drawIcon(ctx, 'oil', iconStates['oil']);
        lCircle.drawIcon(ctx, 'engineFail', iconStates['engineFail']);

        lCircle.drawMultiplier(ctx, 1, -20);
        lCircle.drawArrow(ctx, value, 160, 5, 300);
        lCircle.drawArrowBody(ctx);
    };

    const drawRightCircle = (ctx: CanvasRenderingContext2D, options: SpeedoCircleOptions, radius: number, value: number, iconStates: Record<string, any>) => {
        const rCircle = new AdditionalCircle(options, 'right', canvasRef.current!, radius);
        rCircle.draw(ctx);

        const addMarksAngles = rCircle.calcMarksAngles(8, 140, 80);
        const mainMarksAngles = rCircle.calcMarksAngles(9, 160, 80);

        rCircle.drawDangerZone(ctx, addMarksAngles, 6, 0, 2);
        rCircle.drawDangerZone(ctx, mainMarksAngles, 6, 0, 2);

        rCircle.drawMarks(ctx, addMarksAngles, 7.5, 2, true, 1, 0, 2, 'all', 0, 5);
        rCircle.drawMarks(ctx, mainMarksAngles, 6, 3, true, 0, 0, 2, 'even', 0, 6);

        const textMarksAngles = rCircle.calcTextMarksAngles(3, 160, -5, 80);
        rCircle.drawTextMarks(ctx, textMarksAngles, 0.5, -16, true, true);

        rCircle.drawIcon(ctx, 'gas', iconStates['gas']);
        rCircle.drawIcon(ctx, 'trunk', iconStates['trunk']);
        rCircle.drawIcon(ctx, 'bonnet', iconStates['bonnet']);
        

        rCircle.drawArrow(ctx, Math.abs(value - 1), 160, 5, 80);
        rCircle.drawArrowBody(ctx);
    };

    return (
        <div id="speedo">
            <div style={{ display: 'none' }}>
                <img id="sprite" src={sprite} alt="icons" />
            </div>
            <div style={{ position: 'relative', width: '440px', height: '210px' }}>
            <canvas ref={canvasSpeedRef} width={440} height={210} style={{ position: 'absolute', top: 0, left: 0, zIndex: 2 }}></canvas>
            <canvas ref={canvasRef} width={440} height={210} style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}></canvas>
            </div>
            
        </div>
    );
};



/////////////////////////////////////////////////

export default class Speedo extends Component<Props, State> {
    readonly state: State = initialState;
    blipers: StateIcons = initialIcons;

    

    icons: Record<string, Icon> = {
        'dippedBeam': { offset: { x: -22.5, y: 47.5 }, position: { x: 10, y: 150 * 0 + 10 * 1 }, dimensions: { width: 17.5, height: 17.5 }, states: 3 },
        'highBeam': { offset: { x: -22.5, y: 47.5 }, position: { x: 10, y: 150 * 4 + 10 * 5 }, dimensions: { width: 17.5, height: 17.5 }, states: 3 },
        'doors': { offset: { x: -45, y: 47.5 }, position: { x: 10, y: 150 * 15 + 10 * 16 }, dimensions: { width: 17.5, height: 17.5 }, states: 2 },
        'brake': { offset: { x: -80, y: 47.5 }, position: { x: 10, y: 150 * 1 + 10 * 2 }, dimensions: { width: 17.5, height: 17.5 }, states: 2 },
        'drift': { offset: { x: 0, y: 47.5 }, position: { x: 10, y: 150 * 2 + 10 * 3 }, dimensions: { width: 17.5, height: 17.5 }, states: 2 },
        'lock': { offset: { x: 80, y: 47.5 }, position: { x: 10, y: 150 * 6 + 10 * 7 }, dimensions: { width: 17.5, height: 17.5 }, states: 2 },
        'seatBelt': { offset: { x: 45, y: 47.5 }, position: { x: 10, y: 150 * 8 + 10 * 9 }, dimensions: { width: 17.5, height: 17.5 }, states: 2 },
        'engineTemp': { offset: { x: 62.5, y: 70 }, position: { x: 10, y: 150 * 10 + 10 * 11 }, dimensions: { width: 17.5, height: 17.5 }, states: 3 },
        'stab': { offset: { x: 22.5, y: 47.5 }, position: { x: 10, y: 150 * 12 + 10 * 13 }, dimensions: { width: 17.5, height: 17.5 }, states: 2 },
        'abs': { offset: { x: -62.5, y: 70 }, position: { x: 10, y: 150 * 14 + 10 * 15 }, dimensions: { width: 17.5, height: 17.5 }, states: 2 },
        'gas': { offset: { x: 5, y: 55 }, position: { x: 10, y: 150 * 3 + 10 * 4 }, dimensions: { width: 17.5, height: 17.5 }, states: 3 },
        'trunk': { offset: { x: 22.5, y: 25 }, position: { x: 10, y: 150 * 7 + 10 * 8 }, dimensions: { width: 17.5, height: 17.5 }, states: 2 },
        'bonnet': { offset: { x: -5, y: 25 }, position: { x: 10, y: 150 * 11 + 10 * 12 }, dimensions: { width: 17.5, height: 17.5 }, states: 2 },
        'battery': { offset: { x: 17.5, y: 50 }, position: { x: 10, y: 150 * 5 + 10 * 6 }, dimensions: { width: 17.5, height: 17.5 }, states: 3 },
        'oil': { offset: { x: 5, y: 32.5 }, position: { x: 10, y: 150 * 9 + 10 * 10 }, dimensions: { width: 17.5, height: 17.5 }, states: 3 },
        'engineFail': { offset: { x: -10, y: 50 }, position: { x: 10, y: 150 * 13 + 10 * 14 }, dimensions: { width: 17.5, height: 17.5 }, states: 3 }
    };

    options: SpeedoCircleOptions = {
        circleBorderWidth: 4,
        circleBorderColor: '#8b8b8b',
        circleFillColor: '#000000',
        markFillColor: '#ffffff',
        markStrokeColor: '#000000',
        markFontColor: '#ffffff',
        markFontSize: 16,
        markFontStyle: 'italic',
        markFontFamily: 'Arial, sans-serif',
        arrowBodyFillColor: '#0d0d0d',
        arrowBodyStrokeColor: '#212121',
        arrowColor: '#ff0000',
        arrowBaseWidth: 2.5,
        arrowBorderWidth: 3,
        dangerColor: '#c1272d',
        dangerZoneWidth: 5,
        turnSignalColor: '#57d53f',
        supportColor: 'red',
        speedUnit: 'km',
        icons: this.icons,
        turnSignal: {
            left: new TurnSignal(-7.5, -35, 20, 15),
            right: new TurnSignal(7.5, -35, 20, 15)
        }
    };

    componentDidMount() {
        rpc.register('Speedometer-UpdateState', (state: State) => this.setState(() => state));
        rpc.register('Speedometer-UpdateIcons', (blipers: StateIcons) => this.setIcons(blipers));
    }

    setIcons = (blipers: StateIcons) => {
        this.blipers = { ...this.blipers, ...blipers }; // Update blipers directly
        this.forceUpdate(); // Force re-render manually
    };

    componentWillUnmount() {
        rpc.unregister('Speedometer-UpdateState');
        rpc.unregister('Speedometer-UpdateIcons');
    }

    render() {
        const {
            inVehicle,
            velocity,
            maxspeed,
            rpm
        } = this.state;

        const {
            engine,
            fuel,
            cruise,
            locked,
            lung,
            scurt,
            dooro,
            brake,
            rightl,
            leftl,
            seatbelt
        } = this.blipers;
        let totalgas = 0;
        let gasicon = 0;
        totalgas = this.blipers.fuel.current / this.blipers.fuel.max;
        if (totalgas > 0.5) {
            gasicon = 0;
        } else {
            if (totalgas > 0.2 && totalgas <= 0.5) {
                gasicon = 1;
            } else {
                gasicon = 2;
            }
        }
        let enginei = 0;
        if (this.blipers.engine.health > 50) {
            enginei = 0;
        } else {
            if (this.blipers.engine.health > 20 && this.blipers.engine.health <= 50) {
                enginei = 1;
            } else {
                enginei = 2;
            }
        }


        return (
            inVehicle && (

                    <div id="speedo">
                        <Speedometer
                            options={this.options}
                            // duration={300}
                            speedometerValue={((velocity/maxspeed)/10)*1.9} // Replace with actual speed calculation
                            speedValue={velocity}
                            tachometerValue={rpm}    // Replace with actual tachometer value
                            gasValue={this.blipers.fuel.current/this.blipers.fuel.max}           // Replace with actual gas value
                            mileage={velocity}            // Replace with actual mileage
                            iconStates={{
                                dippedBeam: this.blipers.scurt,
                                brake: this.blipers.brake,
                                drift: 1,
                                highBeam: this.blipers.lung,
                                lock: locked,
                                seatBelt: seatbelt,
                                engineTemp: 0,
                                stab: 1,
                                abs: 1,
                                gas: gasicon,
                                trunk: 1,
                                bonnet: 1,
                                doors: this.blipers.dooro,
                                battery: 1,
                                oil: 0,
                                engineFail: enginei, 
                                left: this.blipers.leftl,
                                right: this.blipers.rightl
                            }}
                        />
                    </div>

            )
        );
    }
}