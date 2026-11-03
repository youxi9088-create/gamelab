import math


def validate_wheel(action):
    numbers=[action.get('x'),action.get('y'),action.get('delta_x',0),action.get('delta_y')]
    ticks=action.get('ticks',1)
    if (not all(type(n) in (int,float) and math.isfinite(n) for n in numbers)
            or not 0<=numbers[0]<=1000 or not 0<=numbers[1]<=844
            or abs(numbers[2])>1200 or abs(numbers[3])>1200
            or not (numbers[2] or numbers[3]) or type(ticks) is not int or not 1<=ticks<=12):
        raise ValueError('wheel需要画面内x/y、非零delta_y（可带delta_x，绝对值不超过1200）及ticks 1..12；动作尚未执行')
