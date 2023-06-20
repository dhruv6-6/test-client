import {React , useState} from "react";
import {Link} from 'react-router-dom';

const Join = ()=>{
    const[room , setRoom] = useState("");


    return(
        <div>
            <input placeholder="Room" onChange={(event) => setRoom(event.target.value)}></input>
            <Link onClick={e => (!room) ? e.preventDefault() : null} to={`/call?room=${room}`}>
                <button type="submit">Join</button>
            </Link>
        </div>
    )
}

export default Join;