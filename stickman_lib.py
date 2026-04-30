import pygame
import sys
import math

pygame.init()

_font_large  = pygame.font.SysFont("Menlo", 36, bold=True)
_font_medium = pygame.font.SysFont("Menlo", 28, bold=True)
_font_small  = pygame.font.SysFont("Menlo", 22, bold=True)
_font_tiny   = pygame.font.SysFont("Menlo", 16)


def _draw_char(surface, char, x, y, font, color):
    text = font.render(char, True, color)
    rect = text.get_rect(center=(int(x), int(y)))
    surface.blit(text, rect)


def _draw_stickman(surface, x, y, frame, direction, color, parts):
    swing     = math.sin(frame) * 30
    arm_swing = math.sin(frame) * 25
    bob       = abs(math.sin(frame)) * 4
    base_y    = y - bob

    # Head
    _draw_char(surface, parts["head"], x, base_y - 50, _font_large, color)

    # Neck
    _draw_char(surface, parts["neck"], x, base_y - 32, _font_small, color)

    # Torso (3 stacked)
    for i in range(3):
        _draw_char(surface, parts["torso"], x, base_y - 20 + i * 14, _font_medium, color)

    # Shoulders
    shoulder_y = base_y - 18
    _draw_char(surface, parts["shoulder"], x, shoulder_y, _font_small, color)

    # ── LEGS ──
    leg_top_y = base_y + 18
    foot_char = parts["foot_right"] if direction == 1 else parts["foot_left"]

    for side in (-1, 1):                        # -1 = left leg, 1 = right leg
        angle     = swing * side * -1           # legs swing opposite to each other
        knee_x    = x + side * 8 + math.sin(math.radians(angle)) * 12
        knee_y    = leg_top_y + 18
        foot_x    = knee_x + math.sin(math.radians(angle * 0.6)) * 8
        foot_y    = leg_top_y + 40

        # upper segment
        if abs(angle) > 15:
            upper = parts["leg_forward"] if angle * direction > 0 else parts["leg_back"]
        else:
            upper = parts["leg_straight"]
        _draw_char(surface, upper,
                   (x + knee_x) / 2, (leg_top_y + knee_y) / 2, _font_medium, color)

        # lower segment
        _draw_char(surface, parts["leg_straight"],
                   (knee_x + foot_x) / 2, (knee_y + foot_y) / 2, _font_medium, color)

        # foot
        _draw_char(surface, foot_char,
                   foot_x + 6 * direction, foot_y + 8, _font_small, color)

    # ── ARMS ──
    for side in (-1, 1):                        # -1 = left arm, 1 = right arm
        angle    = arm_swing * side * -1
        elbow_x  = x + side * 18 + math.sin(math.radians(angle)) * 10
        elbow_y  = shoulder_y + 16
        hand_x   = elbow_x + math.sin(math.radians(angle * 0.5)) * 6
        hand_y   = shoulder_y + 32

        # upper segment
        if angle * direction > 10:
            upper = parts["arm_back"]
        elif angle * direction < -10:
            upper = parts["arm_forward"]
        else:
            upper = parts["arm_straight"]
        _draw_char(surface, upper,
                   (x + side * 8 + elbow_x) / 2, (shoulder_y + elbow_y) / 2,
                   _font_small, color)

        # lower segment
        _draw_char(surface, parts["arm_straight"],
                   (elbow_x + hand_x) / 2, (elbow_y + hand_y) / 2, _font_small, color)

        # hand
        _draw_char(surface, parts["hand"], hand_x, hand_y + 6, _font_small, color)


def run(
    # Window
    window_width  = 900,
    window_height = 500,
    window_title  = "Walking Stickman",
    # Colors
    bg_color      = (0,   0,   0),
    stickman_color= (255, 255, 255),
    # Movement
    walk_speed    = 2.0,
    anim_speed    = 5.0,
    # Body part characters
    head          = "☻",
    neck          = "│",
    torso         = "║",
    shoulder      = "═══",
    hand          = "✋",
    foot_right    = "▶",
    foot_left     = "◀",
    arm_straight  = "│",
    arm_forward   = "╱",
    arm_back      = "╲",
    leg_straight  = "│",
    leg_forward   = "╱",
    leg_back      = "╲",
):
    screen = pygame.display.set_mode((window_width, window_height))
    pygame.display.set_caption(window_title)
    clock  = pygame.time.Clock()
    FPS    = 60

    center_y = window_height // 2

    parts = dict(
        head=head, neck=neck, torso=torso, shoulder=shoulder,
        hand=hand, foot_right=foot_right, foot_left=foot_left,
        arm_straight=arm_straight, arm_forward=arm_forward, arm_back=arm_back,
        leg_straight=leg_straight, leg_forward=leg_forward, leg_back=leg_back,
    )

    x         = 100.0
    direction = 1
    frame     = 0.0

    while True:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()

        keys   = pygame.key.get_pressed()
        moving = False

        if keys[pygame.K_RIGHT]:
            x        += walk_speed
            direction  = 1
            moving     = True
        if keys[pygame.K_LEFT]:
            x        -= walk_speed
            direction  = -1
            moving     = True

        if not moving:          # auto-walk right if no key pressed
            x    += walk_speed * 0.5
            moving = True

        if x > window_width + 50:
            x = -50.0
        elif x < -50:
            x = window_width + 50.0

        frame += anim_speed / FPS

        screen.fill(bg_color)
        _draw_stickman(screen, x, center_y, frame, direction, stickman_color, parts)

        hint = _font_tiny.render("← → to walk", True,
                                 tuple(min(c + 80, 255) for c in bg_color))
        screen.blit(hint, (10, 10))

        pygame.display.flip()
        clock.tick(FPS)
