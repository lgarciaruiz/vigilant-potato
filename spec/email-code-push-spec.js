'use babel';

import EmailCodePush from '../lib/email-code-push';

// Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
//
// To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
// or `fdescribe`). Remove the `f` to unfocus the block.

describe('EmailCodePush', () => {
  let workspaceElement, activationPromise;

  beforeEach(() => {
    workspaceElement = atom.views.getView(atom.workspace);
    activationPromise = atom.packages.activatePackage('email-code-push');
  });

  describe('when the email-code-push:toggle event is triggered', () => {
    it('hides and shows the modal panel', () => {
      // Before the activation event the view is not on the DOM, and no panel
      // has been created
      expect(workspaceElement.querySelector('.email-code-push')).not.toExist();

      // This is an activation event, triggering it will cause the package to be
      // activated.
      atom.commands.dispatch(workspaceElement, 'email-code-push:toggle');

      waitsForPromise(() => {
        return activationPromise;
      });

      runs(() => {
        expect(workspaceElement.querySelector('.email-code-push')).toExist();

        let emailCodePushElement = workspaceElement.querySelector('.email-code-push');
        expect(emailCodePushElement).toExist();

        let emailCodePushPanel = atom.workspace.panelForItem(emailCodePushElement);
        expect(emailCodePushPanel.isVisible()).toBe(true);
        atom.commands.dispatch(workspaceElement, 'email-code-push:toggle');
        expect(emailCodePushPanel.isVisible()).toBe(false);
      });
    });

    it('hides and shows the view', () => {
      // This test shows you an integration test testing at the view level.

      // Attaching the workspaceElement to the DOM is required to allow the
      // `toBeVisible()` matchers to work. Anything testing visibility or focus
      // requires that the workspaceElement is on the DOM. Tests that attach the
      // workspaceElement to the DOM are generally slower than those off DOM.
      jasmine.attachToDOM(workspaceElement);

      expect(workspaceElement.querySelector('.email-code-push')).not.toExist();

      // This is an activation event, triggering it causes the package to be
      // activated.
      atom.commands.dispatch(workspaceElement, 'email-code-push:toggle');

      waitsForPromise(() => {
        return activationPromise;
      });

      runs(() => {
        // Now we can test for view visibility
        let emailCodePushElement = workspaceElement.querySelector('.email-code-push');
        expect(emailCodePushElement).toBeVisible();
        atom.commands.dispatch(workspaceElement, 'email-code-push:toggle');
        expect(emailCodePushElement).not.toBeVisible();
      });
    });
  });
});
