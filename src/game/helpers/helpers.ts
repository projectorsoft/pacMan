import { ICircleBasedSprite, IRectangleBasedSprite } from "../IColidableObject.js";
import { Color } from "../enums.js";
import { Point } from "../point.js";
import { Wall } from "../wall.js";

export class Helpers {
    private static paddingFactor: number[] = [
        0, 1, 1, 2, 2, 2, 3, 4, 4, 4
    ]
    
    public static isColliding(circle: ICircleBasedSprite, rectangle: IRectangleBasedSprite, velocity: Point): boolean {
        const velocityFactor = Math.abs(velocity.x !== 0 ? velocity.x : velocity.y);
        const padding = Wall.Width / 2 - circle.radius - Helpers.paddingFactor[velocityFactor - 1];
    
        return (circle.position.y - circle.radius + velocity.y < rectangle.position.y + rectangle.height + padding
            && circle.position.x + circle.radius + velocity.x > rectangle.position.x - padding
            && circle.position.y + circle.radius + velocity.y > rectangle.position.y - padding
            && circle.position.x - circle.radius + velocity.x < rectangle.position.x + rectangle.width + padding);
    }

    public static getRndInteger(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    public static hypot(a: number, b: number) {
        return Math.sqrt(a * a + b * b);
    }
    
    public static addAlphaValueToColor(color: Color, alphaValue: number): string {
        return color.replace(')', `, ${alphaValue})`);
    }

    public static hasTouchScreen(): boolean {
        return 'ontouchstart' in window;
    }
}
