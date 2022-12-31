import React, { useState } from 'react';

const Home = () => {
    const [searchValue, setSearchValue] = useState('');
    const [names, setNames] = useState([]);

    const handleSearchInputChange = (e) => {
        setSearchValue(e.target.value);

        if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            this.updateHandleClick();
        }

        fetch(`http://localhost:42500/names?letter=${e.target.value}`)
            .then(response => response.json())
            .then(data => {
                setNames(data);
            })
            .catch(error => {
            })
    };


    const updateHandleClick = () => {
        const input = document.querySelector('input');
        fetch(`http://localhost:42500/update?name=${input.value}`)
            .then(response => response.json())
            .then(data => {
                setNames(data);
            })
            .catch(error => {
                console.log('error', error);
            });

        setTimeout(() => {
            input.value = '';
        }, 1000);
    };

    const subMenuSelect = (e) => {
        setSearchValue(e.target.innerText);

        fetch(`http://localhost:42500/update?name=${e.target.innerText}`)
            .then(response => response.json())
            .then(data => {
                setNames(data);
            })
            .catch(error => {
                console.log('error', error);
            });

        const input = document.querySelector('input');
        setTimeout(() => {
            input.value = '';
        }, 1000);
    }

    const cancelHandleClick = () => {
        const input = document.querySelector('input');
        fetch(`http://localhost:42500/update?cancel=1&name=${input.value}`)
            .then(response => response.json())
            .then(data => {
                setNames(data);
            })
            .catch(error => {
                console.log('error', error);
            });
        setTimeout(() => {
            input.value = '';
        }, 1000);
    }

    return (
        <div className="row mt-lg-5">
            <div className="col-md-4">
            </div>
            <div className="col-md-4">
                <div className="input-group rounded">
                    <input type="text" className="form-control rounded" placeholder="Search" aria-label="Search" aria-describedby="search-addon" autoComplete="off" value={searchValue} onChange={handleSearchInputChange} />
                    <button type="submit" className="btn btn-outline-primary" id="search-addon" onClick={updateHandleClick}>
                        Submit
                    </button>
                    <button type="button" className="btn btn-outline" onClick={cancelHandleClick}>
                        Cancel (Decrease Trust Level)
                    </button>                    
                </div>
                <div>
                    {names.length > 0 && (
                        <ul>
                            {names.map(name => (
                                <li key={name.name}><span onClick={subMenuSelect}>{name.name}</span> <span className="badge bg-primary float-end">{name.trust}</span></li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
            <div className="col-md-4">
            </div>
        </div>
    );
}
export default Home;