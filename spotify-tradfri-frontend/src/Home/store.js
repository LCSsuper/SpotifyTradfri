import request from "superagent";

class HomeStore {
    initialize = async (search, history) => {
        if (search.includes("?code")) {
            const token = search.split("?code=")[1];
            await this.access(token);
            setTimeout(() => history.push("/playing"), 500);
        }
    };

    access = async token => {
        await request.get(`http://localhost:8080/access/${token}`);
    };

    connect = async () => {
        const { text } = await request.get(
            "http://localhost:8080/spotify/authorize"
        );
        window.location = text;
    };
}

export default new HomeStore();
