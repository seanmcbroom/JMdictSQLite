## 🤝 Contributing
I welcome anyone with interest to contribute!

### 🛠️ Editorial Policies
- Follow the [fork and PR workflow](https://docs.github.com/en/get-started/exploring-projects-on-github/contributing-to-a-project).  
- Keep each PR focused on a specific change whenever possible.  
  - If you have large changes planned, split them into multiple PRs.
  - For major changes, please open a discussion in the **Issues** tab first.
- Every PR must be reviewed by a project manager before being merged.  
- Use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) for commit messages to maintain a clear history.  
- This project uses **TypeScript**, so ensure your code is properly typed.  
- Make sure your code passes linting checks. 

### 💬 Feedback
Discussions about bugs and improvements will be held in the **Issues** tab.

## 💻 How to Run Locally
Requires: node 22.11.00+, npm 10.9.0+
```bash
git clone https://github.com/seanmcbroom/JMdictSQLite
```
```bash
cd JMdictSQLite
```
```bash
npm ci
```
```bash
npm run create-release
```
The resulting SQLite file will be generated at: `/data/jmdict.sqlite`<br>
You are free to use or distribute the file in accordance with the terms of the [GPLv2 license](./LICENSE).
