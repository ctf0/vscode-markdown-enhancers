# Markdown Enhancers

- support code **hover** & **lens** of `Run | Copy` for code blocks
- support indented code blocks which [markdown-script](https://marketplace.visualstudio.com/items?itemName=axetroy.vscode-markdown-script) doesnt support
- support hovering nested lines in code blocks (line must start with `$`)

## Notes

- there is no way to know if the code block is executable or not, therefor `Run | Copy` are always available
- code blocks with any of the below will be cleaned b4 being *executed* or *copied*
    - starts with dollar sign `$`
    - end with a comment `// ...` or `/* ...`
- decorated links hover doesnt work https://github.com/microsoft/vscode/issues/105302
