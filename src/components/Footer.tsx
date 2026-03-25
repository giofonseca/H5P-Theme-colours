/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="pt-12 border-t border-neutral-200 text-center space-y-4">
      <p className="text-[10px] text-neutral-500 leading-relaxed max-w-3xl mx-auto">
        H5P is a registered <a href="https://h5p.org/trademark" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">trademark</a> of H5P Group. 
        This website was created by <a href="https://giovanni-fonseca.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Giovanni Fonseca</a> who is not affiliated with or endorsed by <a href="https://h5p.group/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">H5P Group</a>. 
        The creation of this web app was facilitated by Google AI Studio and based on the <a href="https://github.com/otacke/h5p-theme-picker" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">H5P Theme Picker</a> by <a href="https://snordian.de/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Oliver Tacke</a> and its code is opened <a href="https://github.com/giofonseca/H5P-Theme4Moodle" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">here</a> to be audited by everyone.
      </p>
      <p className="text-[9px] text-neutral-400 uppercase tracking-widest">
        Built with h5p-theme-picker & React
      </p>
    </footer>
  );
};
