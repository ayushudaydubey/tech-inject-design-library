# Tech Inject Design Library — answers.md

## 1. Reference analysis

I used the Sales CRM reference as the visual source of truth and grouped repeated UI patterns into reusable components instead of rebuilding CRM business screens. I focused on reusable patterns such as buttons, inputs, cards, data/feedback states, navigation and CRM-style data components, with variants and states handled inside the component where appropriate. I also used shared theme values for typography, spacing, borders, radii and colours.

For verification, I compared the recreated components and catalogue UI against the reference at similar sizes and checked the important interaction states such as hover, focus, selected, disabled, loading and error states. The public catalogue uses its own product identity while keeping the component theme based on the CRM reference.

## 2. Architecture and clean code

I used a TurboRepo monorepo with separate Next.js/TypeScript public and admin apps, an Express/TypeScript backend, MongoDB for persistent records, and a separate CLI package. The public app is responsible for catalogue and documentation UX, the admin app handles publishing and premium management, and the backend remains the source of truth for authentication, publication and premium access.

A practical DRY decision was keeping component metadata, source files, preview data, dependencies and agent prompts in the same published component record so preview, copy, installer and agent integration use the same versioned content. I intentionally avoided building a general-purpose code editor, payment system, marketplace, multi-framework installer or unnecessary role system because those were outside the assignment scope.

## 3. Publishing consistency

A published component stores its metadata, source/supporting files, preview/example data, dependencies and integration information together. The public preview, copied source, CLI installer and AI-agent prompt are generated from that published component data rather than separate hardcoded component implementations.

Drafts remain private until published. When a component is unpublished, it is removed from public discovery and subsequent protected source/installation requests are blocked, while already copied code is not remotely removed.

## 4. Security

The main risks were exposing premium source files, allowing unauthorized admin writes, executing uploaded component code, or allowing the CLI to write outside the consumer project or silently overwrite files. I implemented server-side authentication/authorization, current premium checks, protected component APIs, upload validation, restricted preview handling, safe path checks and overwrite protection in the installer.

Premium access is checked on protected preview/source/download/install/agent requests instead of relying only on hidden UI buttons. The installer also checks dependency compatibility and stops on conflicting existing files rather than silently overwriting them. A remaining limitation is that revocation cannot remove code that a customer already copied or installed, which is expected by the assignment.

## 5. AI ownership

AI was used extensively for planning, implementation, debugging, preview architecture, CLI work and testing, but I reviewed the generated changes against the assignment requirements and tested the important flows myself. One important issue I challenged was generic component preview behavior: early implementations could show fixture data or fail when component props were incomplete, so I changed the preview approach to normalize fixture data and resolve component source/styles/dependencies generically instead of adding component-specific switches.

I also tested the AI-agent prompt in a clean React + TypeScript consumer project and verified that the prompt could be copied from the catalogue and used to integrate a component. The CLI was tested separately with free, premium and unauthorized access cases.

## 6. Production ownership

I checked the deployed public frontend, admin dashboard and backend separately, including authentication, component discovery, premium access and installer/agent integration paths. The deployed stack uses persistent backend data and environment-based configuration, and the production CLI uses the deployed backend by default.

If a newly published component breaks, I would first inspect the component record, source/supporting files, preview data, dependency declarations and backend logs, then unpublish the affected component to stop new retrieval/install requests. I would restore the last known-good published content or deployment without deleting persistent component/customer data and communicate the affected component, current access state and recovery status to the team.

## 7. Premium access

Customer access is modeled separately from component publication and admin permissions. A component can be published as premium while a customer can independently be free or premium; only the backend can grant or revoke premium access.

Signed-out and free customers are blocked from protected premium source/install/agent requests, while premium customers can access them. The CLI uses authenticated login and the backend verifies current premium access before installation. Revocation blocks subsequent protected requests, but it cannot remove source code that was already copied or installed by the customer.
