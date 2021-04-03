const MAX_SEQ_LENGTH = 500;
const getRandomPatents = (size) => {
    const randomPatents = [];
    const assignedIds = {};
    for(let i = 0; i < size; i++) {
        const patentIds = ['1134992', '1134993', '1134994', '1134995', '1134996', '1134997', '1134998', '2134992', '3134992'];
        const asignees = ['Pfizer', 'Amgen Inc', 'Regeneron Pharmaceuticals'];
        const amino = ['A', 'R', 'N', 'D'];
        const randomPatent = patentIds[Math.floor(Math.random() * patentIds.length)];
        const randomResidue = Math.floor(Math.random() * MAX_SEQ_LENGTH) + 1;
        const randomAmino = amino[Math.floor(Math.random() * amino.length)];
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
            'Assignee': randomAssignee,
            'Claimed': true,
            'Amino Acid': randomAmino
        }
    }


    return randomPatents;
}

/* 
 * The current heatmap component does not have a simple way to show data the way we want it where we want the full table of sequences from 0 - n and
 * only paint the items that are present. Previously we had that but the data points were incorrect as it creates a cumulative results based on previous points for that
 * patent. The one way I was able to make the chart show correct data points was the following:
 * 1) Items need to be filtered by Sequence Position
 * 2) Sequence Position needs to be a String (making it a number will create the cumulative logic and return incorrect points)
 * 3) One patent should have the entire sequence to make the chart show ALL entries (else it would only show only our data points so { patentId: 2, claimedResidue: 3 }, { patentId: 2, claimedResidue: 7 })
 *    the chart will only show 3 and 7 in the X axis not 1, 2, 3, 4, 5, 6, 7 with only 2 and 7 painted.
 * 
 * WORKAROUND: We add the base sequence as a patent at the bottom of the chart. This way we will have an empty patent with every data point. We leverage this and we will use it to show the amino acid sequence
*/
let baseline = [];
for (let i = 1; i <= MAX_SEQ_LENGTH; i++) {
    const amino = ['A', 'R', 'N', 'D'];
    const randomAmino = amino[Math.floor(Math.random() * amino.length)];
    baseline.push({
        'Patent Number': 'Sequence',
        'Assignee': 'Sequence',
        'Sequence Position': i.toString(),
        'Amino Acid': randomAmino
    })
}

const mockResults = getRandomPatents(80).concat(baseline).sort((a, b) => {
    if(parseInt(a['Sequence Position']) < parseInt(b['Sequence Position'])) {
        return -1;
    } else if (parseInt(a['Sequence Position']) > parseInt(b['Sequence Position'])) {
        return 1;
    } else {
        if (a['Patent Number'] === 'Sequence') {
            return -1;
        }
        if(parseInt(a['Patent Number']) < parseInt(b['Patent Number'])) {
            return -1;
        } else if (parseInt(a['Patent Number']) > parseInt(b['Patent Number'])) {
            return 1;
        }
    }

    return 0;
});
export default mockResults;