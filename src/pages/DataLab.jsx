import React from 'react';
import DataLabComponent from '../components/ForDataLabPage/DataLabComponent';
const DataLab = () => {
    return (
        <div style={styles.container}>
            <div>
                <DataLabComponent />
            </div>
        </div>
    );
};

const styles = {
    container: {
        padding: '20px',
    },
};

export default DataLab;