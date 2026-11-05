'use strict';

const path = require('node:path');

const SOURCE = '@glimmer/tracking';
const POLYFILL = 'ember-tracked-as-function-polyfill';
const POLYFILLED_EXPORTS = new Set([
  'tracked',
  'Reactive',
  'ReadOnlyReactive',
  'TrackedValue',
]);

function exportedName(node) {
  return node.type === 'StringLiteral' ? node.value : node.name;
}

function partition(specifiers, getName) {
  let polyfilled = [];
  let rest = [];

  for (let specifier of specifiers) {
    if (POLYFILLED_EXPORTS.has(getName(specifier))) {
      polyfilled.push(specifier);
    } else {
      rest.push(specifier);
    }
  }

  return { polyfilled, rest };
}

function trackedAsFunctionPolyfill(babel) {
  const t = babel.types;

  return {
    name: 'ember-tracked-as-function-polyfill',
    visitor: {
      Program(path) {
        for (let statement of path.get('body')) {
          if (statement.isImportDeclaration()) {
            rewriteImport(statement);
          } else if (statement.isExportNamedDeclaration()) {
            rewriteExport(statement);
          }
        }
      },
    },
  };

  function rewriteImport(path) {
    let { node } = path;

    if (node.source.value !== SOURCE) return;

    let { polyfilled, rest } = partition(node.specifiers, (specifier) =>
      specifier.type === 'ImportSpecifier'
        ? exportedName(specifier.imported)
        : undefined,
    );

    if (polyfilled.length === 0) return;

    node.source = t.stringLiteral(POLYFILL);

    if (rest.length === 0) return;

    node.specifiers = polyfilled;

    for (let specifier of rest) {
      path.scope.removeOwnBinding(specifier.local.name);
    }

    let [inserted] = path.insertAfter(
      t.importDeclaration(rest, t.stringLiteral(SOURCE)),
    );

    inserted.node.importKind = node.importKind;
    path.scope.registerDeclaration(inserted);
  }

  function rewriteExport(path) {
    let { node } = path;

    if (!node.source || node.source.value !== SOURCE) return;

    let { polyfilled, rest } = partition(node.specifiers, (specifier) =>
      specifier.type === 'ExportSpecifier'
        ? exportedName(specifier.local)
        : undefined,
    );

    if (polyfilled.length === 0) return;

    node.source = t.stringLiteral(POLYFILL);

    if (rest.length === 0) return;

    node.specifiers = polyfilled;

    let [inserted] = path.insertAfter(
      t.exportNamedDeclaration(null, rest, t.stringLiteral(SOURCE)),
    );

    inserted.node.exportKind = node.exportKind;
  }
}

module.exports = trackedAsFunctionPolyfill;
module.exports.baseDir = () => path.resolve(__dirname);
