import DataLoader from 'dataloader';
import user from './user';

const createDataLoader = (ctx) => ({
    user: new DataLoader(user),
});

export default createDataLoader;
