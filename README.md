# Dash Wrapped

Create a DoorDash Wrapped from your order history.

## Install

Install the skill on your computer:

```bash
npx skills add rheasanger/dash-wrapped-skill --skill dash-wrapped -g -y
```

Then ask your agent:

```text
Create a DoorDash Wrapped for me.
```

The skill uses the official [DoorDash CLI](https://github.com/doordash-oss/doordash-cli). If it is missing, the skill installs the supported official build. On first use, complete `dd-cli login` in the browser; the CLI stores the login in your operating-system keychain.
