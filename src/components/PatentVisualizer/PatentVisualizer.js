import React, { useState, useEffect } from 'react';
import { Heatmap } from '@ant-design/charts';
import { assignColors } from '../../utils/colors';
import mock from './mockResults';

/* 
 * Maps an array of objects to a new array of objects where each key has a random color assigned 
*/
const defineColorsBy = (data, key) => {
    const assigneeArray = data.map((elem) => elem[key]);
    const uniqueAssignees = new Set(assigneeArray);
    return assignColors(Array.from(uniqueAssignees));
}

const PatentVisualizer = () => {
    const [data, setData] = useState([]);
    const [colorKeys, setColorKeys] = useState({});
    useEffect(() => {
        asyncFetch();
    }, []);
    const asyncFetch = () => {
        Promise.resolve(mock)
            .then((response) => {
                setData(response);
                setColorKeys(defineColorsBy(response, 'Asignee'));
            })
            // .then((json) => setData(json))
            .catch((error) => {
                console.log('fetch data failed', error);
            });
    };
    var config = {
        width: 650,
        height: 500,
        autoFit: true,
        data: data,
        xField: 'Sequence Position',
        axis: {
            grid: {
                line: {
                    style: {
                        stroke: 'black',
                        lineWidth: 1,
                        strokeOpacity: 0.1,
                        cursor: 'pointer'
                    }
                }
            }
        },
        yField: 'Patent Number',
        // container: (<div>Hello World</div>),
        colorField: 'Asignee',
        color: (assignee) => {
            return colorKeys[assignee];
        },
        meta: { 'Sequence Position': { type: 'cat' } },
    };
    return <Heatmap {...config} />;
};

export default PatentVisualizer;