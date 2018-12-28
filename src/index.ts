import { Application, Context } from "probot";

export = (app: Application) => {

    /**
     * Search similar file with changed line
     * @param {Context} context robot API
     */
    async function similarSearch(context: Context) {
        const repoName = context.payload.pull_request.head.repo.full_name;

        const contents: string[] = [];
        const issue = context.issue();
        const allFiles = await context.github.pullRequests.listFiles(issue);
        for (const file of allFiles.data) {

            // Deleted lines
            const deletedLines = file.patch.match(/(\n-)+\s*[^\d-](.*)/g);

            if (!deletedLines) { return; }

            // Create search strings
            for (const line in deletedLines) {
                if (deletedLines.hasOwnProperty(line)) {
                    let content = deletedLines[line].replace(/(\n\s*-)/g, "");
                    content = content.replace(/\s/g, "+");
                    contents.unshift(`${content}+repo:${repoName}`);
                }
            }

            let similarItems: any[] = [];
            let contentsLen = contents.length;
            contents.map( (content) => {
                context.github.search.code({q: content}).then((result) => {
                    const searchedItems = result.data.items;

                    similarItems = similarItems.concat(searchedItems);

                    contentsLen -= 1;
                    if (contentsLen === 0) {
                        let similarFiles = similarItems.map((item) => {
                            return "\n* " + item.name + ":" + item.html_url;
                        });

                        similarFiles = similarFiles.filter((x, i, self) => {
                            return self.indexOf(x) === i;
                        });
                        const output = `Similar files are\n${similarFiles.toString()}`;
                        const params = context.issue({body: output});
                        context.github.issues.createComment(params);
                    }
                });
            });
        }
    }
    app.on("pull_request.opened", similarSearch);
};
