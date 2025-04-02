export default async function Page(){

    console.log('Fetching revenue data...');
    await new Promise((resolve) => setTimeout(resolve, 3000));

    console.log('Data fetch completed after 3 seconds.');
        return <p>customer page</p>
}
