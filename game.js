/**
 * CELEBRATING POPCORN: OG MECHANICS ENGINE
 * Logic: Hand-drawn Kernels, Tactical Shielder AI, 4 Boss Stages.
 */

const canvas = document.getElementById('stage'), ctx = canvas.getContext('2d');
let W, H, player, entities = [], bullets = [], frame = 0, state = 'MENU';
const PAN_R = 370; // Pan boundary limit

// --- PROCEDURAL DRAWING: HAND-DRAWN STYLE ---
function drawEntity(ctx, x, y, type, status, shieldActive) {
    ctx.save(); ctx.translate(x, y);
    
    if (status === 'POPPED') {
        // Fluffy Popcorn Shape
        ctx.fillStyle = '#fff'; ctx.beginPath();
        for(let i=0; i<5; i++) {
            ctx.arc(Math.cos(i)*6, Math.sin(i)*6, 10, 0, 7);
        }
        ctx.fill();
    } else {
        // Asymmetric Corn Kernel
        ctx.fillStyle = type==='HEAL' ? '#a5d6a7' : type==='SHIELD' ? '#90caf9' : '#ffcc80';
        ctx.beginPath();
        ctx.moveTo(0, -14);
        ctx.bezierCurveTo(10, -8, 8, 12, 0, 14); // Hand-drawn curves
        ctx.bezierCurveTo(-8, 12, -10, -8, 0, -14);
        ctx.fill();
        // Dot Eyes
        ctx.fillStyle = '#4e342e'; ctx.beginPath();
        ctx.arc(-3, -3, 1.8, 0, 7); ctx.arc(3, -3, 1.8, 0, 7); ctx.fill();
    }

    if (shieldActive) {
        ctx.strokeStyle = '#4fc3f7'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(0, 0, 22, 0, 7); ctx.stroke();
    }
    ctx.restore();
}

class Kernel {
    constructor(x, y, type, isBot) {
        this.x = x; this.y = y; this.type = type; this.isBot = isBot;
        this.hp = 2; this.shield = 0; this.cooldown = 0;
        this.target = {x, y};
    }

    update() {
        if (this.hp <= 0) return;
        
        if (this.isBot) {
            // TACTICAL AI: Shielders stand in front of Salt
            const bossPhase = document.getElementById('boss-name').innerText;
            if (bossPhase === 'SALT' && this.type === 'SHIELD') {
                this.target = { x: W/2 + Math.sin(frame*0.04)*120, y: H/2 - 130 };
                if (this.cooldown === 0) { this.shield = 90; this.cooldown = 300; }
            } else if (frame % 80 === 0) {
                // Random move within the Pan circular area
                const ang = Math.random() * 6.28, rad = Math.random() * 250;
                this.target = { x: W/2 + Math.cos(ang)*rad, y: H/2 + 150 + Math.random()*100 };
            }
        }
        
        // Soft Movement
        this.x += (this.target.x - this.x) * 0.08;
        this.y += (this.target.y - this.y) * 0.08;

        // PAN BOUNDARY: Trigonometry limit
        const dist = Math.hypot(this.x - W/2, this.y - H/2);
        if (dist > PAN_R) {
            const angle = Math.atan2(this.y - H/2, this.x - W/2);
            this.x = W/2 + Math.cos(angle) * PAN_R;
            this.y = H/2 + Math.sin(angle) * PAN_R;
        }

        if (this.shield > 0) this.shield--;
        if (this.cooldown > 0) this.cooldown--;
    }
}

// Full logic for Boss pattern handling (Butter, Salt, Fire, Microwave) 
// continues here using the frame-based state machine.
