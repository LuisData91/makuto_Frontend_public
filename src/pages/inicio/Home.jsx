import { useContext } from "react"
import { GeneralContext } from "../../context/generalContext"

const Home = () => {

    const { usuActual } = useContext(GeneralContext);

    


    return (
        <div>Bienvenidos a MAkuto</div>
    )
}

export default Home