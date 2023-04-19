/**
 * hai-platform 前端 eslint 配置
 *
 * @see https://www.npmjs.com/search?q=%40hai-platform%2Feslint
 */
module.exports = {
  root: true,
  extends: ['@hai-platform'],
  // 暂时先不对 __tests__ 下的进行 lint，否则会提示标红
  overrides: [
    {
      files: ['*.js', '*.mjs', '*.cjs'],
      rules: {
        'no-console': [
          'warn',
          {
            allow: ['info', 'warn', 'error'],
          },
        ],
      },
    },
    {
      files: ['*.ts', '*.vue'],
      extends: ['@hai-platform/vue'],
      parserOptions: {
        project: [
          './apps/**/tsconfig.json',
          './packages/**/tsconfig.json',
          './shared/**/tsconfig.json',
          './servers/**/tsconfig.json',
          './shared/**/tsconfig.json',
        ],
        tsconfigRootDir: __dirname,
      },
      rules: {
        'import/no-extraneous-dependencies': 'off',
        'no-underscore-dangle': 'off',
        'import/extensions': 'off',
        'vue/multi-word-component-names': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-unused-expressions': 'off',
        'class-methods-use-this': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        'no-console': [
          'warn',
          {
            allow: ['info', 'warn', 'error'],
          },
        ],
      },
    },
    {
      files: ['*.tsx'],
      extends: ['@hai-platform/react'],
      parserOptions: {
        project: [
          './apps/**/tsconfig.json',
          './packages/**/tsconfig.json',
          './servers/**/tsconfig.json',
          './shared/**/tsconfig.json',
        ],
        tsconfigRootDir: __dirname,
      },
      rules: {
        'react/prop-types': [2, { ignore: ['children'] }],
        'import/no-extraneous-dependencies': 'off',
        // 暂时不强制要求写 propTypes
        'react/require-default-props': 'off',
        'react/button-has-type': 'off',
        // 由于一些历史代码，确实带了下划线，这个后面在改：
        'no-underscore-dangle': 'off',
        // 这个问题有的时候会有坑，我们需要注意下
        // 'import/no-cycle': 'off',
        // 很多时候写起来不方便，有的时候也没办法写，因为这种提示实在太多了，就暂时把 warning 也关了
        '@typescript-eslint/explicit-function-return-type': 'off',
        // // 这个基本只是在 expr && do something 这种情况下提示，但这种写法对我们来说会比较方便
        //  @update: 这个默认开启对于我们的代码出错检测还是有帮助的，建议开启，详情案例：
        //  commit/4064ce910753a3b018a00f27349a85e765da3323
        // '@typescript-eslint/no-unused-expressions': 'off',
        // 有些时候出于可维护性，这个不开代码更清晰：
        'class-methods-use-this': 'off',
        // 模板字符串有些时候，反而会让可读性变差：
        'prefer-template': 'off',
        // 有些场景不开这个代码更加易读：
        '@typescript-eslint/no-non-null-assertion': 'off',
        // 比如 log 模块还没有初始化的时候，或者有时候我们确实需要打一些东西到控制台，可以使用部分 console:
        'no-console': [
          'warn',
          {
            allow: ['info', 'warn', 'error'],
          },
        ],
      },
    },
    {
      files: ['apps/monitor/**/*.vue'],
      rules: {
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/dot-notation': 'off',
      },
    },
    {
      files: ['apps/monitor/src/pages/**/*.vue'],
      rules: {
        'vue/multi-word-component-names': 'off',
      },
    },
  ],
}
