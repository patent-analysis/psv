const MAX_SEQ_LENGTH = 500;
const getRandomPatents = (size) => {
    const randomPatents = [];
    const assignedIds = {};
    for(let i = 0; i < size; i++) {
        const patentIds = ['1134992', '1134993', '1134994', '1134995', '1134996', '1134997', '1134998', '2134992', '3134992'];
        const asignees = ['Pfizer', 'Amgen Inc', 'Regeneron Pharmaceuticals'];
        const randomPatent = patentIds[Math.floor(Math.random() * patentIds.length)];
        const randomResidue = Math.floor(Math.random() * MAX_SEQ_LENGTH) + 1;
        let randomAssignee; 
        if(assignedIds[randomPatent]) {
            randomAssignee = assignedIds[randomPatent];
        } else {
            randomAssignee = asignees[Math.floor(Math.random() * asignees.length)];
            assignedIds[randomPatent] = randomAssignee;
        }
        randomPatents[i] = {
            'Patent Number': randomPatent,
            'Sequence Position': randomResidue.toString(),
            'Assignee': randomAssignee
        }
    }


    return randomPatents;
}


const mockResults = getRandomPatents(80).sort((a, b) => {
    if(parseInt(a['Sequence Position']) < parseInt(b['Sequence Position'])) {
        return -1;
    } else if (parseInt(a['Sequence Position']) > parseInt(b['Sequence Position'])) {
        return 1;
    } else {
        if(parseInt(a['Patent Number']) < parseInt(b['Patent Number'])) {
            return -1;
        } else if (parseInt(a['Patent Number']) > parseInt(b['Patent Number'])) {
            return 1;
        }
    }

    return 0;
});
export default mockResults;