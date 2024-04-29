import numpy as np
import os

xmin = -250
xmax = 250
ymin = -52
ymax = 418

player = []
x_pos = []
y_pos = []
made = []
# X ranges from -250 to 250
# Half-court Y ranges from -52 to 418
with open("shots/NBA Shot Locations 1997 - 2020.csv", 'r', encoding="utf-8") as file:
    line = file.readline()
    header = []
    locations = []
    if line:
        header = line.strip().split(',')
        locations = np.zeros(5, dtype=int)
        locations[0] = header.index('Player Name')
        locations[1] = header.index('X Location')
        locations[2] = header.index('Y Location')
        locations[3] = header.index('Shot Made Flag')
    line = file.readline()
    while line:
        part = line.strip().split(',')
        player.append(part[locations[0]])
        x_pos.append(part[locations[1]])
        y_pos.append(part[locations[2]])
        made.append(part[locations[3]])
        line = file.readline()

# X ranges from -25 to 25
# Half-court Y ranges from 0 to 50
for year in range(2021, 2024):
    with open("shots/NBA_" + str(year) + "_Shots.csv", 'r', encoding="utf-8") as file:
        line = file.readline()
        header = []
        locations = []
        if line:
            header = line.strip().split(',')
            locations = np.zeros(5, dtype=int)
            locations[0] = header.index('PLAYER_NAME')
            locations[1] = header.index('LOC_X')
            locations[2] = header.index('LOC_Y')
            locations[3] = header.index('SHOT_MADE')
        line = file.readline()
        while line:
            part = line.strip().split(',')
            player.append(part[locations[0]])
            x_coord = float(part[locations[1]])
            x_coord = (x_coord + 25) / (50) * (xmax - xmin) + xmin
            x_pos.append(str(int(round(x_coord))))
            y_coord = float(part[locations[2]])
            y_coord = (y_coord) / (50) * (ymax - ymin) + ymin
            y_pos.append(str(int(round(y_coord))))
            if part[locations[3]] == "TRUE":
                made.append("1")
            elif part[locations[3]] == "FALSE":
                made.append("0")
            else:
                print("Error: Unknown flag " + part[locations[3]])
            line = file.readline()

with open("shots.csv", 'w', encoding='utf-8') as file:
    file.write("Player,X_Position,Y_Position,Shot_Made\n")
    for i in range(len(player)):
        file.write(player[i] + "," + x_pos[i] + "," + y_pos[i] + "," + made[i] + "\n")