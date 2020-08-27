import createWithApollo from "./createWithApollo";
import client from "../graphql/client";

const withApollo = createWithApollo(client);

export default withApollo;
