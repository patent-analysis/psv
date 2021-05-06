import { API } from 'aws-amplify';

function getPatentData(proteinId){
    /**
     * Fetch patent details from the patents database for the given $proteinId
     */
    const apiName = 'patentsAPI';
    const path = '/patents'; 
    const myInit = { 
        headers: {}, 
        response: false, // Only return response.data
        queryStringParameters: {  
            'proteinId': proteinId
        }
    };
    return API.get(apiName, path, myInit);
}

function getProteinList() {
    /**
     * Fetch patent details from the patents database for the given $proteinId
     */
    const apiName = 'proteinsAPI';
    const path = '/proteins'; 
    const myInit = { 
        headers: {}, 
        response: false, // Only return response.data
    };
    return API.get(apiName, path, myInit);
}

function addProteinToList(proteinObj) {
    /**
     * Fetch patent details from the patents database for the given $proteinId
     */
    const apiName = 'proteinsAPI';
    const path = '/proteins'; 
    const myInit = { 
        headers: {}, 
        body: proteinObj,
        response: false, // Only return response.data
    };
    return API.put(apiName, path, myInit);
}

function savePatentData(data){
    const apiName = 'patentsAPI';
    const path = '/patents';
    const myInit = {
        headers : {},
        response: false,
        body: data
    };
    return API.put(apiName, path, myInit);
}

async function postAlignSequences(data = []) {
    const url = 'https://wfwm01p2j4.execute-api.us-east-1.amazonaws.com/Prod/align/';
    const response = await fetch(url, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data) // body data type must match "Content-Type" header
    })
    return response.json(); // parses JSON response into native JavaScript objects
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
*/
function generateBaseline(sequenceData) {
    let baseline = [];
    for (let i = 0; i <= sequenceData.value.length; i++) {
        baseline.push({
            'patentNumber': 'Sequence',
            'patentAssignees': 'Sequence',
            'sequencePosition': (i + 1).toString(),
            'Amino Acid': sequenceData.value[i],
            'patentNumberAndSeq': 'Sequence',
            'Claimed': false,
        })
    }
    return baseline;
}

// We require to sort the data in a specific way in order to visualize correctly.
// The main requirement is that we have the full sequence at the beginning of the array
// If we ever include every position on each patent we can remove this requirement as every patent
// Would contain the full sequence
function sortDataset(dataset) {
    return dataset.sort((a, b) => {
        if(parseInt(a['sequencePosition']) < parseInt(b['sequencePosition'])) {
            return -1;
        } else if (parseInt(a['sequencePosition']) > parseInt(b['sequencePosition'])) {
            return 1;
        } else {
            if (a['patentNumber'].includes('Sequence')) {
                return -1;
            }
            if(parseInt(a['patentNumber']) < parseInt(b['patentNumber'])) {
                return -1;
            } else if (parseInt(a['patentNumber']) > parseInt(b['patentNumber'])) {
                return 1;
            }
        }
        return 0;
    });
}
function findSequenceBySeqId(sequenceArray, seqId) {
    for(let i = 0; i < sequenceArray.length; i++) {
        if(sequenceArray[i].seqIdNo === seqId) {
            return sequenceArray[i].value.match(/.{1,3}/g);;
        }
    }
    return [];
}

function mergeSequenceWithResidues(patentArray) {
    const alignedPatentData = JSON.parse(JSON.stringify(patentArray));
    return alignedPatentData.map((patent) => {
        return { ...patent, 
            mentionedResidues: patent.mentionedResidues.map((residues) => {
                const sequence = findSequenceBySeqId(patent.sequences, residues.seqId);
                return { ...residues, value: sequence, originalLength: sequence.length }
            })
        }
    });
}

function getBiggestOriginalSequence(patentData) {
    let largestSequence = { originalLength: 0, value: [] };
    patentData.forEach((patentInfo) => {
        patentInfo.mentionedResidues.forEach((residue) => {
            if(residue.originalLength > largestSequence.originalLength) {
                largestSequence = residue;
            }
        });
    });
    return largestSequence;
}

function generateVisualizationDataset(patentData) {
    /**
     * The $patentData retrieved from the patents database contains comma-separated
     * lists of claimed residues. This function explodes the patentData to generate JSONs
     * for every claimed reside - to build the heat map visualization.
     */
    let visualizationDataset = [];
    let i = 0;
    // We select the largest sequence as the default baseline sequence as it is likely
    // It is the full protein sequence
    const defaultBaseline = getBiggestOriginalSequence(patentData);
    const baseline = generateBaseline(defaultBaseline);
    patentData.forEach((patentInfo) => {
        const assignee = patentInfo['patentAssignees']
        const patentNumber = patentInfo['patentNumber']
        const mentionedResidues = patentInfo['mentionedResidues'];
        const patentName = patentInfo['patentName'];
        for(let j = 0; j < mentionedResidues.length; j++) {
            const residuesList = mentionedResidues[j].claimedResidues.filter((residue) => residue);
            const residueMap = {}
            // We create a map here so we do not go through the list each time on each sequence iteration
            // to see if the position is in the residue list array
            residuesList.forEach((residue) => {
                residueMap[residue] = true;
            });
            if(mentionedResidues[j].location !== 'claim') {
                // We do not want to visualize non claim sequences and residues
                continue;
            }
            const sequence = mentionedResidues[j].value;
            // eslint-disable-next-line
            sequence.forEach((aminoAcid, index) => {
                const sequencePosition = index + 1;
                const sequenceInt = parseInt(sequencePosition);
                // If the residue position is larger than our aminoacid list we ignore this data
                if (sequenceInt < sequence.length) {
                    const visualizationData = {
                        'patentAssignees': assignee,
                        'patentNumber': patentNumber,
                        'patentName': patentName,
                        'sequencePosition': sequencePosition.toString(),
                        'Claimed': residueMap[sequencePosition.toString()] || false,
                        'Amino Acid': aminoAcid,
                        'seqId': mentionedResidues[j].seqId,
                        'patentNumberAndSeq': `${patentNumber.substring(0, 2) + patentNumber.substring(patentNumber.length -5, patentNumber.length - 2)}_SEQ_${mentionedResidues[j].seqId}`
                    };
                    visualizationDataset[i] = visualizationData;
                    i++;
                }
            });
        }
    });

    return sortDataset(visualizationDataset.concat(baseline));
}

export {
    getPatentData,
    getProteinList,
    addProteinToList,
    postAlignSequences,
    generateVisualizationDataset,
    mergeSequenceWithResidues,
    savePatentData,
    sortDataset
};
