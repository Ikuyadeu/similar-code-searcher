module.exports = (robot) => {

    /**
     * Search similar file with changed line
     * @returns Result filename
     */
    async function similarSearch(context) {
        const pull = (await context.github.issues.get(context.issue())).data,
            diffUrl = pull.pull_request.diff_url,
            repoName = context.payload.pull_request.head.repo.full_name;
        const request = require("request");
        const contents = [];

        await request(diffUrl, function (error, response, body) {
            if (error) return;

            // Deleted lines
            const deletedLines = body.match(/(\n-)+\s*[^\d-](.*)/g);

            if (!deletedLines) return;

            // Get all deleted lines
            for (const line in deletedLines) {
                if (deletedLines.hasOwnProperty(line)) {
                    let content = deletedLines[line].replace(/(\n\s*-)/g, "");
                    content = content.replace(/\s/g, "+");
                    contents.unshift(`${content}+repo:${repoName}`);
                }
            }

            let similarItems = [];
            let contentsLen = contents.length;
            contents.map(function (content) {
                context.github.search.code({"q": content}).then(result => {
                    const searchedItems = result.data.items;

                    similarItems = similarItems.concat(searchedItems);

                    contentsLen -= 1;
                    if (contentsLen === 0) {
                        let similarFiles = similarItems.map(function (item) {
                            return "\n* " + item.name + ":" + item.html_url;
                        });

                        similarFiles = similarFiles.filter(function (x, i, self) {
                            return self.indexOf(x) === i;
                        });
                        const output = `Similar files are\n${similarFiles.toString()}`,
                            params = context.issue({"body": output});
                        return context.github.issues.createComment(params);
                    }
                });
            });
        });
    }

    robot.on("pull_request.opened", similarSearch)
}
