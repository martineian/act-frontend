import {action, observable, runInAction} from "mobx";
import {
    autoResolveDataLoader,
    checkObjectStats,
    searchCriteriadataLoader
} from "../core/dataLoaders";
import MainPageStore from "./MainPageStore";
import {Query, Search} from "./QueryHistory";


const maxFetchLimit = 2000;

class BackendStore {

    root: MainPageStore;

    @observable isLoading: boolean = false;
    @observable error: Error | null = null;

    constructor(root: MainPageStore) {
        this.root = root;
    }

    arrayToObjectWithIds(inputArray: Array<any>) {
        return inputArray.reduce((acc, curr) => ({
                ...acc,
                [curr.id]: curr
            }),
            {})
    }

    @action
    async executeQuery(search: Search) {

        const id = JSON.stringify(search);

        // Skip for existing queries
        if (this.root.queryHistory.queries.some((q) => q.id === id)) {
            return;
        }

        try {
            this.isLoading = true;
            const approvedAmountOfData = await checkObjectStats(search, maxFetchLimit);

            if (!approvedAmountOfData) return;

            const result = await searchCriteriadataLoader(search).then(autoResolveDataLoader);
            const q: Query = {
                id: id,
                search: search,
                result: {
                    facts: this.arrayToObjectWithIds(result.data.factsData),
                    objects: this.arrayToObjectWithIds(result.data.objectsData)
                }
            };
            this.root.queryHistory.addQuery(q);

        } catch (err) {
            runInAction(() => {
                this.error = err;
            });
        } finally {
            runInAction(() => {
                this.isLoading = false
            })
        }
    }
}

export default BackendStore;