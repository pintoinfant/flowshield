# Contributing to FlowShield

Thank you for your interest in contributing to FlowShield! We welcome contributions from the community and are grateful for your support in making financial privacy accessible to everyone.

This document provides guidelines for contributing to the project. Please take a moment to review these guidelines before submitting your contributions.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Requirements](#testing-requirements)
- [Documentation](#documentation)
- [Community](#community)

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive experience for everyone. We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

**Positive behaviors include:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable behaviors include:**
- Trolling, insulting/derogatory comments, and personal attacks
- Public or private harassment
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate

### Enforcement

Instances of unacceptable behavior may be reported by contacting the project team at pintoinfant5650@gmail.com. All complaints will be reviewed and investigated promptly and fairly.

##Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v18 or higher
- **npm** or **pnpm** (latest version)
- **Git**
- **A code editor** (VS Code recommended)
- **MetaMask** or compatible Web3 wallet (for testing)
 
### Initial Setup

1. **Fork the Repository**
   ```bash
   # Click the "Fork" button on GitHub
   # Then clone your fork
   git clone https://github.com/YOUR_USERNAME/flowshield.git
   cd flowshield
   ```

2. **Add Upstream Remote**
   ```bash
   git remote add upstream https://github.com/pintoinfant/flowshield.git
   ```

3. **Install Dependencies**
   ```bash
   # Install contract dependencies
   cd contracts
   npm install
   
   # Install web dependencies
   cd ../web
   npm install
   ```

4. **Set Up Environment**
   ```bash
   # In /contracts directory
   cp .env.example .env
   # Edit .env with your configuration
   
   # In /web directory
   cp .env.local.example .env.local
   # Edit .env.local with your configuration
   ```

5. **Verify Setup**
   ```bash
   # Test contracts
   cd contracts
   npx hardhat test
   
   # Test web build
   cd ../web
   npm run build
   ```

## 🛠️ How to Contribute

### Types of Contributions

We welcome various types of contributions:

####  Bug Reports
- Use the GitHub issue tracker
- Check if the bug has already been reported
- Include detailed steps to reproduce
- Provide environment details (OS, Node version, etc.)
- Add screenshots or error logs if applicable

####  Feature Requests
- Open an issue with the `enhancement` label
- Clearly describe the feature and its benefits
- Explain use cases and potential impact
- Discuss implementation approaches if possible

####  Documentation
- Fix typos or clarify existing documentation
- Add missing documentation
- Improve code comments
- Create tutorials or guides

####  Code Contributions
- Bug fixes
- New features
- Performance improvements
- Test coverage improvements
- Refactoring

####  Design Contributions
- UI/UX improvements
- Logo or branding updates
- Visual documentation

##  Development Workflow

### 1. Create a Branch

Always create a new branch for your work:

```bash
# Update your local main branch
git checkout main
git pull upstream main

# Create a new branch
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

**Branch Naming Convention:**
- `feature/` - New features (e.g., `feature/multi-token-support`)
- `fix/` - Bug fixes (e.g., `fix/withdrawal-validation`)
- `docs/` - Documentation updates (e.g., `docs/api-reference`)
- `refactor/` - Code refactoring (e.g., `refactor/pool-management`)
- `test/` - Test additions/improvements (e.g., `test/integration-coverage`)
- `chore/` - Maintenance tasks (e.g., `chore/update-dependencies`)

### 2. Make Your Changes

#### For Smart Contract Changes:

```bash
cd contracts

# Edit your Solidity files
# contracts/contracts/*.sol

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Check coverage
npx hardhat coverage

# Run linter (if configured)
npm run lint
```

#### For Web Application Changes:

```bash
cd web

# Edit your files
# app/, components/, lib/

# Run development server
npm run dev

# Check types
npx tsc --noEmit

# Run linter
npm run lint

# Build production
npm run build
```

### 3. Write Tests

**All code contributions must include tests!**

#### Smart Contract Tests:

```typescript
// contracts/test/YourFeature.ts
import { expect } from "chai"
import { ethers } from "hardhat"

describe("YourFeature", function () {
  it("Should do something correctly", async function () {
    // Test implementation
  })
  
  it("Should handle edge cases", async function () {
    // Edge case tests
  })
})
```

#### Test Coverage Requirements:
- **Minimum 80% coverage** for new code
- Test happy paths and edge cases
- Test error conditions and reverts
- Test access control and permissions

### 4. Document Your Changes

- Update relevant documentation
- Add JSDoc/NatSpec comments to functions
- Update README.md if needed
- Add inline comments for complex logic

##  Coding Standards

### Smart Contracts (Solidity)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title Brief contract title
/// @notice Explanation of what this contract does
/// @dev Additional technical details for developers
contract MyContract {
    // State variables
    uint256 public myVariable;
    
    /// @notice Brief function description
    /// @param paramName Description of parameter
    /// @return Description of return value
    function myFunction(uint256 paramName) external returns (uint256) {
        // Function implementation
        return paramName * 2;
    }
}
```

**Standards:**
- Use Solidity ^0.8.0 or higher
- Follow [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)
- Use NatSpec documentation
- Implement proper access control
- Include reentrancy guards where needed
- Validate inputs and handle errors
- Emit events for state changes
- Gas optimization where appropriate

### TypeScript/JavaScript

```typescript
/**
 * Brief function description
 * @param paramName - Description of parameter
 * @returns Description of return value
 */
export function myFunction(paramName: string): number {
  // Implementation
  return parseInt(paramName, 10)
}
```

**Standards:**
- Use TypeScript for type safety
- Follow [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- Use meaningful variable and function names
- Keep functions small and focused (single responsibility)
- Avoid magic numbers - use named constants
- Handle errors gracefully
- Use async/await over promises
- Prefer functional programming patterns

### React Components

```tsx
import { useState } from 'react'

interface MyComponentProps {
  title: string
  onAction: () => void
}

/**
 * MyComponent - Brief description
 */
export function MyComponent({ title, onAction }: MyComponentProps) {
  const [state, setState] = useState(false)
  
  return (
    <div>
      <h2>{title}</h2>
      <button onClick={onAction}>Action</button>
    </div>
  )
}
```

**Standards:**
- Use functional components with hooks
- Type all props and state
- Extract complex logic to custom hooks
- Keep components focused and reusable
- Use meaningful component names
- Implement proper error boundaries

### Code Formatting

We use automated formatting tools:

**Prettier Configuration:**
```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

**Run Formatting:**
```bash
# Format smart contracts
cd contracts
npm run format  # if configured

# Format web code
cd web
npm run lint:fix
```

## Commit Guidelines

### Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**

```bash
feat(contracts): add multi-token pool support

Implement support for multiple ERC20 tokens in privacy pools.
Each token can have its own set of denomination pools.

Closes #42

fix(web): resolve withdrawal button disabled state

The withdrawal button was remaining disabled after successful
transaction completion due to incorrect state management.

Fixes #38

docs(readme): update deployment instructions

Add detailed steps for deploying to Optimism mainnet and
clarify environment variable requirements.
```

### Commit Best Practices

- Write clear, descriptive commit messages
- Keep commits atomic (one logical change per commit)
- Reference issues when applicable
- Sign your commits (see CLA.md)

```bash
# Sign your commits
git commit -s -m "feat: add new feature"

# This adds: Signed-off-by: Your Name <your.email@example.com>
```

## Pull Request Process

### Before Submitting

**Checklist:**
- [ ] Code follows project style guidelines
- [ ] Tests added/updated and passing
- [ ] Documentation updated
- [ ] Commits are signed (CLA compliance)
- [ ] Branch is up to date with main
- [ ] No merge conflicts
- [ ] Build succeeds
- [ ] Linter passes

### Creating a Pull Request

1. **Push Your Branch**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Open Pull Request on GitHub**
   - Go to the FlowShield repository
   - Click "New Pull Request"
   - Select your branch
   - Fill out the PR template

3. **PR Title Format**
   ```
   <type>: Brief description of changes
   
   Example:
   feat: Add support for custom denomination pools
   fix: Resolve reentrancy vulnerability in withdraw
   docs: Update smart contract API documentation
   ```

4. **PR Description Template**
   ```markdown
   ## Description
   Brief description of what this PR does.
   
   ## Type of Change
   - [ ] Bug fix (non-breaking change fixing an issue)
   - [ ] New feature (non-breaking change adding functionality)
   - [ ] Breaking change (fix or feature causing existing functionality to change)
   - [ ] Documentation update
   
   ## How Has This Been Tested?
   Describe the tests you ran and their results.
   
   ## Checklist
   - [ ] My code follows the project's style guidelines
   - [ ] I have performed a self-review of my code
   - [ ] I have commented my code, particularly in hard-to-understand areas
   - [ ] I have made corresponding changes to the documentation
   - [ ] My changes generate no new warnings
   - [ ] I have added tests that prove my fix is effective or that my feature works
   - [ ] New and existing unit tests pass locally with my changes
   - [ ] I have signed my commits (CLA compliance)
   
   ## Related Issues
   Closes #(issue number)
   
   ## Screenshots (if applicable)
   Add screenshots here
   ```

### Review Process

1. **Automated Checks**
   - CI/CD pipeline runs tests
   - Linter checks code style
   - Build verification

2. **Code Review**
   - At least one maintainer review required
   - Address all review comments
   - Update PR as needed

3. **Approval and Merge**
   - Maintainer approves PR
   - Squash and merge or rebase
   - Delete branch after merge

### Responding to Review Comments

- Be receptive to feedback
- Ask for clarification if needed
- Make requested changes promptly
- Reply to comments when changes are made
- Mark conversations as resolved when appropriate

## Testing Requirements

### Smart Contract Testing

```bash
cd contracts

# Run all tests
npx hardhat test

# Run specific test file
npx hardhat test test/Flowshield.ts

# Run with gas reporting
REPORT_GAS=true npx hardhat test

# Generate coverage report
npx hardhat coverage
```

**Required Test Categories:**
-  Unit tests for all functions
-  Integration tests for contract interactions
-  Edge case and boundary testing
-  Access control verification
-  Reentrancy attack prevention
-  Gas optimization validation

### Frontend Testing

```bash
cd web

# Type checking
npx tsc --noEmit

# Linting
npm run lint

# Build test
npm run build
```

**Manual Testing:**
- Test in development mode
- Test production build
- Test across different browsers
- Test wallet connections
- Test transaction flows

##  Documentation

### What to Document

1. **Code Comments**
   - Explain WHY, not WHAT
   - Document complex algorithms
   - Explain business logic
   - Note any gotchas or edge cases

2. **API Documentation**
   - Function signatures
   - Parameter descriptions
   - Return values
   - Usage examples
   - Error conditions

3. **README Updates**
   - New features
   - Changed behavior
   - New dependencies
   - Configuration changes

4. **Changelog**
   - Keep CHANGELOG.md updated
   - Follow [Keep a Changelog](https://keepachangelog.com/) format

### Documentation Style

- Use clear, concise language
- Include code examples
- Add diagrams for complex flows
- Keep documentation up-to-date with code changes

##  Community

### Communication Channels

- **GitHub Issues** - Bug reports, feature requests, discussions
- **GitHub Discussions** - General questions and community interaction
- **Email** - pintoinfant5650@gmail.com for private matters

### Getting Help

- Check existing documentation first
- Search closed issues for similar problems
- Ask questions in GitHub Discussions
- Be specific about your problem
- Include relevant code and error messages

### Providing Help

- Answer questions in Discussions
- Review pull requests
- Improve documentation
- Help triage issues

##  Recognition

Contributors are recognized in the following ways:

- Listed in CONTRIBUTORS.md (coming soon)
- Mentioned in release notes for significant contributions
- GitHub contributor badge
- Community recognition and thanks

##  License

By contributing to FlowShield, you agree that your contributions will be licensed under the MIT License. See [CLA.md](./CLA.md) for details on the Contributor License Agreement.

##  Questions?

If you have questions not covered in this guide:

- Open a GitHub Discussion
- Email: pintoinfant5650@gmail.com
- Check the [README.md](./README.md) and [contracts/README.md](./contracts/README.md)

---

##  Thank You!

Thank you for contributing to FlowShield! Your efforts help build a more private and secure financial future for everyone.

**Happy coding! **

---

**Last Updated:** November 24, 2024  
**Project:** FlowShield  
