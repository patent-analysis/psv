import { API } from 'aws-amplify';
import { AMINO_ACID_CODE, AMINO_THREE_LETTER_CODE } from './aminoAcidTable';

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
    // Default options are marked with *
    const response = await fetch(url, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        // mode: 'cors', // no-cors, *cors, same-origin
        //   cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        //   credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json',
        // 'Access-Control-Allow-Origin'
        // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        //   redirect: 'follow', // manual, *follow, error
        //   referrerPolicy: 'unsafe-url', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(data) // body data type must match "Content-Type" header
    })
    return response.json(); // parses JSON response into native JavaScript objects
}


// return Promise.resolve([
//     { docId: data[0].docId, seqs: [
//         {
//             "seqId": "3",
//             "claimedResidues": ["3", "4", "10", "11", "20"],
//             location: "claim",
//             "value": [
//                 "Met",
//                 "Gly",
//                 "-",
//                 "-",
//                 "-",
//                 "Thr",
//                 "Val",
//                 "Ser",
//                 "Ser",
//                 "Arg",
//                 "Arg",
//                 "-",
//                 "Ser",
//                 "Trp",
//                 "Met",
//                 "Gly",
//                 "-",
//                 "-",
//                 "-",
//                 "Thr",
//                 "Val",
//                 "Ser",
//                 "Ser",
//                 "Arg",
//                 "Arg",
//                 "-",
//                 "Ser",
//                 "Trp"
//             ],
//         },
//         {
//             "seqId": "2",
//             "claimedResidues": ["2", "241", "339", "343"],
//             location: "claim",
//             "value": [
//                 "-",
//                 "Thr",
//                 "Gly",
//                 "Thr",
//                 "Val",
//                 "Ser",
//                 "Ser",
//                 "-",
//                 "-",
//                 "-",
//                 "-",
//                 "Arg",
//                 "Arg",
//                 "-",
//                 "Ser",
//                 "Trp",
//                 "Trp",
//                 "Pro",
//                 "-",
//                 "Leu",
//                 "Pro",
//                 "Leu",
//                 "Leu"
//             ] }
//         ]},
//     { docId: data[1].docId, seqs: data[1].seqs },
// ]);

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

const amino = ['A', 'R', 'N', 'D', 'G', 'C', 'P', 'S', 'Y', 'I'];
function getRandomAmino(){
    return amino[Math.floor(Math.random() * amino.length)];
}

let baseline = [];
const MAX_SEQ_LENGTH = 692;
for (let i = 1; i <= MAX_SEQ_LENGTH; i++) {
    baseline.push({
        'patentNumber': 'Sequence',
        'patentAssignees': 'Sequence',
        'sequencePosition': i.toString(),
        'Amino Acid': getRandomAmino(),
        'patentNumberAndSeq': 'Sequence',
        'Claimed': false,
    })
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
                return { ...residues, value: sequence }
            })
        }
    });
}

function generateVisualizationDataset(patentData) {
    /**
     * The $patentData retrieved from the patents database contains comma-separated
     * lists of claimed residues. This function explodes the patentData to generate JSONs
     * for every claimed reside - to build the heat map visualization.
     */
    let visualizationDataset = [];
    let i = 0;

    patentData.forEach((patentInfo) => {
        const assignee = patentInfo['patentAssignees']
        const patentNumber = patentInfo['patentNumber']
        const mentionedResidues = patentInfo['mentionedResidues'];
        for(let j = 0; j < mentionedResidues.length; j++) {
            const residuesList = mentionedResidues[j].claimedResidues.filter((residue) => residue);
            const residueMap = {}
            // We create a map here so we do not go through the list each time on each sequence iteration
            // to see if the position is in the residue list array
            residuesList.forEach((residue) => {
                residueMap[residue] = true;
            });
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
                        'sequencePosition': sequencePosition.toString(),
                        'Claimed': (residueMap[sequencePosition.toString()] && mentionedResidues[j].location === 'claim') || false,
                        'Amino Acid': aminoAcid,
                        'seqId': mentionedResidues[j].seqId,
                        'patentNumberAndSeq': `${patentNumber}_SEQID_${mentionedResidues[j].seqId}`
                    };
                    visualizationDataset[i] = visualizationData;
                    i++;
                }
            });
        }
    });

    // const body = alignedPatentData.map((data) => {
    //     return { 
    //         docId: data.patentNumber, 
    //         seqs: data.mentionedResidues.map((residueData) => {
    //             return {
    //                 seqId: residueData.seqId,
    //                 claimedResidues: residueData.claimedResidues, 
    //                 value: residueData.value 
    //             }
    //         })
    //     }
    // });
    return sortDataset(visualizationDataset);
}

export {
    getPatentData,
    mergeSequenceWithResidues,
    postAlignSequences,
    getProteinList,
    addProteinToList,
    generateVisualizationDataset,
    savePatentData,
    sortDataset
};
