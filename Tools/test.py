import random
# trying to figure out how to generate all unique lists of k items
x = 7
k = 3
values = [i for i in range(x)]

def appendPointer(pointers, x, startI):
    newPointers = [i for i in pointers] # copy pointers into newPointers
    invalid = False
    i = startI # should start at -1
    while i >= -len(pointers):
        newPointers[i] += 1
        if newPointers[i] == x+i+1:
            invalid = appendPointer(pointers, x, i-1)
            if invalid == True:
                return True # thisoperation is invalid
            newPointers = invalid
            newPointers[i] = newPointers[i-1]+1
            return newPointers # operation success
        elif newPointers[i] > x+i+1:
            return True
        else:
            return newPointers
    return True # this operation is invalid

def generateCombinations(x, k, values):
    combinations = []
    pointers = [i for i in range(k)]
    while pointers != True:
        combinations.append([values[pointer] for pointer in pointers])
        pointers = appendPointer(pointers, x, -1)
    return combinations

def shuffle(values):
    i = random.randrange(0, len(values))
    j = random.randrange(0, len(values))
    values[i], values[j] = values[j], values[i]

results = generateCombinations(x, k, values)
for i in range(1000):
    shuffle(results)
for value in results:
    print(value)
