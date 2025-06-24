const { build } = require('vite');
const react = require('@vitejs/plugin-react');
const path = require('path');
const fs = require('fs').promises;
const os = require('os');

class ReactCompiler {
  constructor() {
    this.tempDir = path.join(os.tmpdir(), 'front-fusion-compile');
  }
  async compileReactCode(files) {
    try {
      // Create temporary directory if it doesn't exist
      await fs.mkdir(this.tempDir, { recursive: true });

      // Write files to temporary directory
      for (const [filename, content] of Object.entries(files)) {
        const filePath = path.join(this.tempDir, filename);
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, content);
      }

      // Configure Vite build
      const buildResult = await build({
        root: this.tempDir,
        plugins: [react()],
        build: {
          write: false,
          rollupOptions: {
            input: path.join(this.tempDir, 'src/main.jsx'),
          },
        },
      });

      // Extract the compiled code
      const compiledCode = buildResult.output[0].code;

      // Clean up temporary files
      await this.cleanup();

      return {
        success: true,
        code: compiledCode,
      };
    } catch (error) {
      console.error('React compilation error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async cleanup() {
    try {
      await fs.rm(this.tempDir, { recursive: true, force: true });
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }
}

module.exports = new ReactCompiler(); 