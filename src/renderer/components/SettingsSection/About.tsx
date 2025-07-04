import React, { FC, useEffect, useState } from 'react';
import CoalitionLogo from 'renderer/assets/Coalition_Logo.svg';
import * as packageInfo from '../../../../package.json';
import { ChangelogModal, useModals } from '../Modal';
import { ThirdPartyLicensesModal } from 'renderer/components/Modal/ThirdPartyLicensesModal';

export const AboutSettings: FC = () => {
  const [logoRotation, setLogoRotation] = useState(0);

  useEffect(() => {
    if (logoRotation / 360 > 5) {
      window.electronAPI?.remote.shellOpenExternal('https://www.youtube.com/watch?v=dQw4w9WgXcQ?autoplay=1');

      setLogoRotation(0);
    }
  }, [logoRotation]);

  const handleOpenThirdPartyLicenses = () => {
    showModal(<ThirdPartyLicensesModal />);
  };

  const handleLogoClick = () => {
    setLogoRotation((old) => old + 360);
  };

  const { showModal } = useModals();

  return (
    <div className="flex h-full flex-col justify-center gap-y-8 px-16">
      <div className="flex flex-row items-center gap-x-10">
        <img
          className="cursor-pointer"
          src={CoalitionLogo}
          width={256}
          onClick={handleLogoClick}
          style={
            {
              /*  transform: `rotate(${logoRotation}deg)`, transition: 'transform 200ms linear' */
            }
          }
        />

        <div className="flex flex-col gap-y-3">
          <span className="font-manrope text-4xl font-bold">Coalition of Freeware Developers Installer</span>
          <a
            className="font-manrope text-2xl font-bold text-gray-400 hover:text-gray-600"
            onClick={() => {
              showModal(<ChangelogModal />);
            }}
          >
            v{packageInfo.version}
          </a>
        </div>
      </div>

      <div className="flex flex-col justify-center">
        <span className="text-2xl">
          Copyright (c) 2024-2025 Coalition of Freeware Developers and its contributing members
        </span>
        <span className="text-2xl">Licensed under the GNU General Public License Version 3</span>
        <span className="text-2xl">Licensed under the Laminar Research License</span>

        <span className="mt-4 text-2xl text-gray-200">
          All publisher associated logos are the intellectual property of their respective owners. Media content
          included is licensed under the terms set by the publisher. This installer is designed for X-Plane 12 aircraft,
          scenery, and plugin utilities.
        </span>

        <a className="mt-4 text-xl text-gray-500 hover:text-gray-600" onClick={handleOpenThirdPartyLicenses}>
          Third party licenses
        </a>
      </div>
    </div>
  );
};
