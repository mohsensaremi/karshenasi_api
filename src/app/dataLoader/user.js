import User from "app/models/User";
import {spreadArrayById} from "utils/array";

const userDataLoader = async (keys)=>{
    const items = await User.find({
        _id: {$in: keys}
    });

    return spreadArrayById(keys, items);
};

export default userDataLoader;
